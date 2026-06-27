import { getPrisma } from '../prisma'
import { logger } from '../logger'

const CU_BASE = 'https://api.clickup.com/api/v2'

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: process.env.CLICKUP_API_KEY,
  }
}

function getPriority(interest) {
  if (!interest) return 3
  if (interest.includes('Commercial')) return 1
  if (interest.includes('GZL')) return 2
  return 3
}

function formatPhone(phone) {
  return phone.trim().replace(/\s+/g, ' ')
}

function buildDescription(lead) {
  const entry = lead.raffleEntry
  const lines = [
    'EVENT LEAD - ARD DEVELOPERS',
    '',
    `Name: ${lead.name}`,
    `Phone: ${formatPhone(lead.phone)}`,
    `Email: ${lead.email || '-'}`,
    `NPI: ${lead.npi || '-'}`,
    `Speciality: ${lead.speciality || '-'}`,
    `City: ${lead.city || '-'}`,
    `State: ${lead.state || '-'}`,
    `Interest: ${lead.interest || '-'}`,
    `Brochure via: ${lead.delivery === 'wa' ? 'WhatsApp' : 'Email'}`,
    '',
    'Raffle',
    `Entry #: ${entry?.entryNum || '-'}`,
    `Date: ${entry?.eventDate || new Date().toISOString().split('T')[0]}`,
    '',
    'Source',
    `Source: ${lead.source}`,
    `Event: ${lead.event}`,
    `Time: ${new Date(lead.createdAt || Date.now()).toLocaleString('en-PK')}`,
  ]

  return lines.join('\n')
}

function buildCustomFields() {
  return []
}

async function logIntegration(leadId, type, status, response, integrationError) {
  try {
    if (leadId && !leadId.startsWith('test-')) {
      await getPrisma().integrationLog.create({
        data: { leadId, type, status, response, error: integrationError },
      })
    }
  } catch {
    // Integration logging should never block the user flow.
  }
}

export async function createTask(lead) {
  const listId = process.env.CLICKUP_LIST_ID

  if (!listId || listId.includes('YOUR_CLICKUP')) {
    logger.warn('ClickUp LIST_ID not configured - skipping')
    return { skipped: true }
  }

  const taskPayload = {
    name: `Lead: ${lead.name} - ${formatPhone(lead.phone)}`,
    description: buildDescription(lead),
    status: 'New Lead',
    priority: getPriority(lead.interest),
    due_date: Date.now() + 24 * 60 * 60 * 1000,
    due_date_time: true,
    tags: ['event-lead', 'ard-2025'],
    custom_fields: buildCustomFields(lead),
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(`${CU_BASE}/list/${listId}/task`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(taskPayload),
      signal: controller.signal,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.err || `ClickUp responded ${response.status}`)
    }

    await logIntegration(lead.id, 'clickup', 'success', JSON.stringify({ taskId: data.id }))
    logger.info(`ClickUp task created: ${data.id} for ${lead.name}`)

    return { id: data.id, url: data.url }
  } catch (err) {
    await logIntegration(lead.id, 'clickup', 'failed', null, err.message)
    logger.error(`ClickUp createTask failed: ${err.message}`)
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

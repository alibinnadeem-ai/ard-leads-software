import axios from 'axios'
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

  try {
    const response = await axios.post(`${CU_BASE}/list/${listId}/task`, taskPayload, {
      headers: headers(),
      timeout: 8000,
    })

    await logIntegration(lead.id, 'clickup', 'success', JSON.stringify({ taskId: response.data.id }))
    logger.info(`ClickUp task created: ${response.data.id} for ${lead.name}`)

    return { id: response.data.id, url: response.data.url }
  } catch (err) {
    const errMsg = err.response?.data?.err || err.message
    await logIntegration(lead.id, 'clickup', 'failed', null, errMsg)
    logger.error(`ClickUp createTask failed: ${errMsg}`)
    throw err
  }
}

export async function updateTaskStatus(taskId, status, note) {
  if (!taskId) return

  try {
    await axios.put(
      `${CU_BASE}/task/${taskId}`,
      { status, description: note },
      { headers: headers(), timeout: 8000 }
    )
    logger.info(`ClickUp task ${taskId} updated to ${status}`)
  } catch (err) {
    logger.error(`ClickUp updateTask failed: ${err.message}`)
  }
}

export async function addComment(taskId, comment) {
  if (!taskId) return

  try {
    await axios.post(
      `${CU_BASE}/task/${taskId}/comment`,
      { comment_text: comment },
      { headers: headers(), timeout: 5000 }
    )
  } catch (err) {
    logger.error(`ClickUp addComment failed: ${err.message}`)
  }
}

export async function getListTasks(page = 0) {
  const listId = process.env.CLICKUP_LIST_ID
  if (!listId || listId.includes('YOUR_CLICKUP')) return []

  try {
    const response = await axios.get(
      `${CU_BASE}/list/${listId}/task?page=${page}&order_by=date_created&reverse=true`,
      { headers: headers(), timeout: 8000 }
    )
    return response.data.tasks || []
  } catch (err) {
    logger.error(`ClickUp getListTasks failed: ${err.message}`)
    return []
  }
}

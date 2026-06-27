import { logger } from '../logger'

const MESSENGER360_BASE = 'https://api.360messenger.com/v2'

function normalizePhone(phone) {
  if (!phone) return null

  // 360Messenger expects digits only: country code with no '+' or leading '00'.
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('00')) cleaned = cleaned.slice(2)

  // Pakistan local format 03XXXXXXXXX -> 923XXXXXXXXX
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `92${cleaned.slice(1)}`
  }

  // Already in 92XXXXXXXXXX form
  if (cleaned.startsWith('92') && cleaned.length === 12) {
    return cleaned
  }

  // 10-digit local without the leading 0, e.g. 3XXXXXXXXX
  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    return `92${cleaned}`
  }

  return cleaned || null
}

function buildMessage(lead, entry, backendUrl) {
  return [
    `*Assalamu Alaikum ${lead.name}!*`,
    '',
    'Shukria for visiting *ARD Developers* at our event!',
    '',
    `*Entry #${entry?.entryNum || '-'}* - You're in today's Lucky Draw!`,
    'Winners announced at the ARD Developers Booth',
    '',
    `*Your interest:* ${lead.interest || 'Real Estate'}`,
    '',
    '*Download your free brochure:*',
    `${backendUrl}/api/leads/${lead.id}/pdf`,
    '',
    '*Follow ARD Developers:*',
    'Facebook: facebook.com/arddevelopers',
    'Instagram: @arddevelopers',
    'YouTube: @ARDCity.Official',
    'Website: arddevelopers.com',
    'ARD City: theardcity.com',
    '',
    "_ARD Developers - Building Pakistan's Future_",
  ].join('\n')
}

export async function sendBrochureLink(lead, backendUrl) {
  const apiKey = process.env.MESSENGER360_API_KEY

  if (!apiKey || apiKey.includes('YOUR_') || !lead.phone) {
    logger.warn('360Messenger not configured or no phone - skipping WhatsApp')
    return { skipped: true }
  }

  const toNumber = normalizePhone(lead.phone)
  if (!toNumber) {
    logger.warn(`Could not normalize phone: ${lead.phone}`)
    return { skipped: true, reason: 'Invalid phone format' }
  }

  const entry = lead.raffleEntry
  const message = buildMessage(lead, entry, backendUrl)

  // URLSearchParams as the body makes fetch send application/x-www-form-urlencoded.
  const form = new URLSearchParams({ phonenumber: toNumber, text: message })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(`${MESSENGER360_BASE}/sendMessage`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: controller.signal,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(`360Messenger ${response.status}: ${JSON.stringify(data)}`)
    }

    logger.info(`WhatsApp sent to ${toNumber} via 360Messenger`)
    return { sent: true, to: toNumber, response: data }
  } catch (err) {
    logger.error(`WhatsApp send failed to ${toNumber}: ${err.message}`)
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

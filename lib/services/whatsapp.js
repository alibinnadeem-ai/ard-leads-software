import twilio from 'twilio'
import { logger } from '../logger'

function normalizePhone(phone) {
  if (!phone) return null

  const cleaned = phone.replace(/[^\d+]/g, '')
  if (cleaned.startsWith('+')) return cleaned

  if (cleaned.startsWith('03') && cleaned.length === 11) {
    return `+92${cleaned.substring(1)}`
  }

  if (cleaned.startsWith('92') && cleaned.length === 12) {
    return `+${cleaned}`
  }

  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    return `+92${cleaned}`
  }

  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
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
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM

  if (!accountSid || accountSid.includes('ACxxxxxxx') || !lead.phone) {
    logger.warn('Twilio not configured or no phone - skipping WhatsApp')
    return { skipped: true }
  }

  const toNumber = normalizePhone(lead.phone)
  if (!toNumber) {
    logger.warn(`Could not normalize phone: ${lead.phone}`)
    return { skipped: true, reason: 'Invalid phone format' }
  }

  const entry = lead.raffleEntry
  const message = buildMessage(lead, entry, backendUrl)

  try {
    const client = twilio(accountSid, authToken)
    const msg = await client.messages.create({
      from: fromNumber,
      to: `whatsapp:${toNumber}`,
      body: message,
    })

    logger.info(`WhatsApp sent to ${toNumber}: SID ${msg.sid}`)
    return { sent: true, sid: msg.sid, to: toNumber }
  } catch (err) {
    logger.error(`WhatsApp send failed to ${toNumber}: ${err.message}`)
    throw err
  }
}

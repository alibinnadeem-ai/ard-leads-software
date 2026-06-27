import axios from 'axios'
import { getPrisma } from '../prisma'
import { logger } from '../logger'

function buildWhatsAppMessage(lead, entry, backendUrl) {
  return [
    `Assalamu Alaikum ${lead.name}!`,
    '',
    'Thank you for visiting ARD Developers at our event!',
    '',
    `You are Entry #${entry?.entryNum || '-'} in today's Lucky Draw`,
    'Winners announced at the ARD Developers Booth',
    '',
    `Your registered interest: ${lead.interest || 'Real Estate Investment'}`,
    '',
    'Download your free brochure:',
    `${backendUrl}/api/leads/${lead.id}/pdf`,
    '',
    'Follow us:',
    'Facebook: facebook.com/arddevelopers',
    'Instagram: @arddevelopers',
    'YouTube: @ARDCity.Official',
    'Website: arddevelopers.com',
    '',
    "ARD Developers - Building Pakistan's Future",
  ].join('\n')
}

function buildEmailBody(lead, entry, backendUrl) {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#050E0C;font-family:Arial,sans-serif;color:#F0F5F4">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <div style="background:#1A6B5E;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
      <h1 style="color:white;font-size:28px;margin:0">ARD DEVELOPERS</h1>
      <p style="color:rgba(240,245,244,.8);margin:6px 0 0;font-size:13px">A RUDA-Affiliated Real Estate Development Company</p>
    </div>
    <h2 style="color:#E8C97A;font-size:22px;margin:0 0 8px">Thank You, ${lead.name}!</h2>
    <p style="color:rgba(240,245,244,.75);line-height:1.6;margin:0 0 20px">
      You have been successfully registered at the ARD Developers Event and entered into today's Lucky Draw.
    </p>
    <div style="background:#0A1714;border:1px solid rgba(26,107,94,.3);border-radius:10px;padding:18px;margin-bottom:20px">
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#22897A">Your Details</p>
      <p style="margin:4px 0;font-size:14px"><strong>Entry #:</strong> ${entry?.entryNum || '-'}</p>
      <p style="margin:4px 0;font-size:14px"><strong>Phone:</strong> ${lead.phone}</p>
      <p style="margin:4px 0;font-size:14px"><strong>NPI:</strong> ${lead.npi || '-'}</p>
      <p style="margin:4px 0;font-size:14px"><strong>Speciality:</strong> ${lead.speciality || '-'}</p>
      <p style="margin:4px 0;font-size:14px"><strong>City:</strong> ${lead.city || '-'}</p>
      <p style="margin:4px 0;font-size:14px"><strong>State:</strong> ${lead.state || '-'}</p>
      <p style="margin:4px 0;font-size:14px"><strong>Interest:</strong> ${lead.interest || '-'}</p>
      <p style="margin:4px 0;font-size:14px"><strong>Event Date:</strong> ${entry?.eventDate || new Date().toISOString().split('T')[0]}</p>
    </div>
    <a href="${backendUrl}/api/leads/${lead.id}/pdf"
       style="display:block;background:#1A6B5E;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:bold;margin-bottom:20px">
      Download Your Brochure PDF
    </a>
    <p style="color:rgba(240,245,244,.5);font-size:11px;text-align:center">
      ARD Developers - Rawalpindi / Lahore, Pakistan - WhatsApp: +92 337 960 9994
    </p>
  </div>
</body>
</html>`.trim()
}

async function logIntegration(leadId, type, status, response, integrationError) {
  try {
    if (leadId && !leadId.startsWith('test-')) {
      await getPrisma().integrationLog.create({
        data: { leadId, type, status, response, error: integrationError },
      })
    }
  } catch {
    // Best-effort integration log.
  }
}

export async function send(lead, backendUrl) {
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL

  if (!webhookUrl || webhookUrl.includes('YOUR_ID')) {
    logger.warn('Zapier webhook URL not configured - skipping')
    return { skipped: true }
  }

  const entry = lead.raffleEntry
  const payload = {
    lead_id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email || '',
    npi: lead.npi || '',
    speciality: lead.speciality || '',
    city: lead.city || '',
    state: lead.state || '',
    interest: lead.interest || '',
    delivery: lead.delivery === 'wa' ? 'WhatsApp' : 'Email',
    source: lead.source,
    event: lead.event,
    timestamp: new Date(lead.createdAt || Date.now()).toISOString(),
    entry_number: entry?.entryNum || null,
    event_date: entry?.eventDate || new Date().toISOString().split('T')[0],
    pdf_url: `${backendUrl}/api/leads/${lead.id}/pdf`,
    whatsapp_message: buildWhatsAppMessage(lead, entry, backendUrl),
    email_subject: 'ARD Developers - Your Brochure & Lucky Draw Entry',
    email_body: buildEmailBody(lead, entry, backendUrl),
  }

  try {
    const response = await axios.post(webhookUrl, payload, {
      timeout: 8000,
      headers: { 'Content-Type': 'application/json' },
    })

    await logIntegration(lead.id, 'zapier', 'success', JSON.stringify({ status: response.status }))
    logger.info(`Zapier webhook sent for ${lead.name}`)

    return { sent: true, status: response.status }
  } catch (err) {
    const errMsg = err.response?.data || err.message
    await logIntegration(lead.id, 'zapier', 'failed', null, String(errMsg).substring(0, 500))
    logger.error(`Zapier webhook failed: ${errMsg}`)
    throw err
  }
}

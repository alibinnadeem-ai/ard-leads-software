import nodemailer from 'nodemailer'
import { logger } from '../logger'
import { generateBrochure } from './pdf'

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number.parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  })
}

function buildEmailHTML(lead, entry, backendUrl) {
  const pdfUrl = `${backendUrl}/api/leads/${lead.id}/pdf`
  const date = entry?.eventDate || new Date().toISOString().split('T')[0]

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ARD Developers - Your Brochure</title>
</head>
<body style="margin:0;padding:0;background:#050E0C;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#050E0C">
    <div style="background:linear-gradient(135deg,#1A6B5E,#22897A);padding:32px 28px;text-align:center">
      <h1 style="color:white;font-size:30px;margin:0;letter-spacing:.05em;font-weight:900">ARD DEVELOPERS</h1>
      <p style="color:rgba(240,245,244,.8);margin:6px 0 0;font-size:12px;letter-spacing:.08em;text-transform:uppercase">
        RUDA-Affiliated - Real Estate Excellence
      </p>
    </div>
    <div style="height:3px;background:linear-gradient(90deg,#C9A84C,#E8C97A,#C9A84C)"></div>
    <div style="padding:32px 28px;background:#0A1714">
      <h2 style="color:#E8C97A;font-size:24px;margin:0 0 8px">Assalamu Alaikum, ${lead.name}!</h2>
      <p style="color:rgba(240,245,244,.75);font-size:14px;line-height:1.7;margin:0 0 24px">
        Thank you for visiting <strong style="color:#6ECABA">ARD Developers</strong> at our event.
        You are now registered and entered into today's Lucky Draw.
      </p>
      <div style="background:rgba(26,107,94,.1);border:1px solid rgba(26,107,94,.3);border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="color:#22897A;font-size:11px;letter-spacing:.14em;text-transform:uppercase;margin:0 0 12px">Your Lucky Draw Entry</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="color:rgba(240,245,244,.55);font-size:13px;padding:4px 0;width:45%">Entry Number</td><td style="color:#F0F5F4;font-size:14px;font-weight:700">#${entry?.entryNum || '-'}</td></tr>
          <tr><td style="color:rgba(240,245,244,.55);font-size:13px;padding:4px 0">Event Date</td><td style="color:#F0F5F4;font-size:13px">${date}</td></tr>
          <tr><td style="color:rgba(240,245,244,.55);font-size:13px;padding:4px 0">Phone</td><td style="color:#F0F5F4;font-size:13px">${lead.phone}</td></tr>
          ${lead.npi ? `<tr><td style="color:rgba(240,245,244,.55);font-size:13px;padding:4px 0">NPI</td><td style="color:#F0F5F4;font-size:13px">${lead.npi}</td></tr>` : ''}
          ${lead.speciality ? `<tr><td style="color:rgba(240,245,244,.55);font-size:13px;padding:4px 0">Speciality</td><td style="color:#F0F5F4;font-size:13px">${lead.speciality}</td></tr>` : ''}
          <tr><td style="color:rgba(240,245,244,.55);font-size:13px;padding:4px 0">City</td><td style="color:#F0F5F4;font-size:13px">${lead.city || '-'}</td></tr>
          <tr><td style="color:rgba(240,245,244,.55);font-size:13px;padding:4px 0">State</td><td style="color:#F0F5F4;font-size:13px">${lead.state || '-'}</td></tr>
          <tr><td style="color:rgba(240,245,244,.55);font-size:13px;padding:4px 0">Interest</td><td style="color:#E8C97A;font-size:13px;font-weight:600">${lead.interest || '-'}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin-bottom:28px">
        <a href="${pdfUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#1A6B5E,#2BA090);color:white;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:.03em">
          Download Your Brochure PDF
        </a>
        <p style="color:rgba(240,245,244,.4);font-size:11px;margin:8px 0 0">
          Includes project details, pricing, payment plans &amp; contact info
        </p>
      </div>
      <div style="margin-bottom:24px">
        <p style="color:#C9A84C;font-size:12px;letter-spacing:.14em;text-transform:uppercase;margin:0 0 12px">Our Flagship Projects</p>
        <table style="width:100%;border-collapse:separate;border-spacing:0 6px">
          ${[
            ['GZL Residentials', 'RUDA Phase 1, Lahore'],
            ['Qantara Commercials', 'Premium commercial units'],
            ['ARD Marina Commercials', 'Waterfront commercial spaces'],
          ].map(([name, desc]) => `
          <tr>
            <td style="background:rgba(26,107,94,.08);border:1px solid rgba(26,107,94,.2);border-radius:8px;padding:10px 14px">
              <strong style="color:#F0F5F4;font-size:13px">${name}</strong><br>
              <span style="color:rgba(240,245,244,.5);font-size:11px">${desc}</span>
            </td>
          </tr>`).join('')}
        </table>
      </div>
    </div>
    <div style="background:#1A6B5E;padding:16px 28px;text-align:center">
      <p style="color:white;font-size:12px;font-weight:700;margin:0">ARD DEVELOPERS</p>
      <p style="color:rgba(240,245,244,.7);font-size:11px;margin:4px 0 0">
        Rawalpindi / Lahore, Pakistan | WhatsApp: +92 337 960 9994 | arddevelopers.com
      </p>
    </div>
  </div>
</body>
</html>`
}

function buildEmailText(lead, entry, backendUrl) {
  return `
ARD DEVELOPERS - Your Brochure & Lucky Draw Entry

Assalamu Alaikum ${lead.name}!

Thank you for visiting ARD Developers at our event. You are Entry #${entry?.entryNum || '-'} in today's Lucky Draw.

Your Details:
- Phone: ${lead.phone}${lead.npi ? `\n- NPI: ${lead.npi}` : ''}${lead.speciality ? `\n- Speciality: ${lead.speciality}` : ''}
- City: ${lead.city || '-'}
- State: ${lead.state || '-'}
- Interest: ${lead.interest || '-'}
- Entry #: ${entry?.entryNum || '-'}
- Date: ${entry?.eventDate || new Date().toISOString().split('T')[0]}

Download your brochure: ${backendUrl}/api/leads/${lead.id}/pdf

ARD Developers - WhatsApp: +92 337 960 9994
`.trim()
}

export async function sendBrochure(lead, backendUrl) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !lead.email) {
    return { skipped: true, reason: 'No SMTP config, app password, or email address' }
  }

  const transporter = createTransporter()
  const entry = lead.raffleEntry

  // Attach the personalized brochure PDF so the lead receives it directly via email.
  const attachments = []
  try {
    const personalized = await generateBrochure(lead, backendUrl)
    const safeName = String(lead.name || 'Lead').replace(/\s+/g, '_')
    attachments.push({
      filename: `ARD_Developers_Brochure_${safeName}.pdf`,
      content: personalized,
      contentType: 'application/pdf',
    })
  } catch (err) {
    logger.error(`Failed to generate personalized PDF for ${lead.email}: ${err.message}`)
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"ARD Developers" <${process.env.SMTP_USER}>`,
    to: lead.email,
    subject: `ARD Developers - Your Brochure & Lucky Draw Entry #${entry?.entryNum || ''}`,
    html: buildEmailHTML(lead, entry, backendUrl),
    text: buildEmailText(lead, entry, backendUrl),
    attachments,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    logger.info(`Email sent to ${lead.email}: ${info.messageId}`)
    return { sent: true, messageId: info.messageId }
  } catch (err) {
    logger.error(`Email send failed for ${lead.email}: ${err.message}`)
    throw err
  }
}

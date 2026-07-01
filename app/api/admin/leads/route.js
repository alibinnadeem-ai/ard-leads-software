import { getPrisma } from '@/lib/prisma'
import { json, error } from '@/lib/http'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

function clampInt(value, min, max, fallback) {
  const n = Number.parseInt(value, 10)
  if (Number.isNaN(n)) return fallback
  return Math.min(Math.max(n, min), max)
}

function buildWhere(q) {
  if (!q) return {}
  return {
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } },
      { npi: { contains: q } },
      { speciality: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
      { state: { contains: q, mode: 'insensitive' } },
      { interest: { contains: q, mode: 'insensitive' } },
      { source: { contains: q, mode: 'insensitive' } },
    ],
  }
}

function csvCell(value) {
  const text = value == null ? '' : String(value)
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

function exportRows(leads) {
  const headers = [
    'Entry #', 'Event Date', 'Name', 'Phone', 'Email', 'NPI', 'Speciality', 'City', 'State',
    'Interest', 'Delivery', 'Source', 'Email Sent', 'Winner', 'Prize', 'Registered At',
  ]
  const rows = leads.map((lead) => [
    lead.raffleEntry?.entryNum || '',
    lead.raffleEntry?.eventDate || '',
    lead.name,
    lead.phone,
    lead.email || '',
    lead.npi || '',
    lead.speciality || '',
    lead.city || '',
    lead.state || '',
    lead.interest || '',
    lead.delivery === 'wa' ? 'WhatsApp' : 'Email',
    lead.source,
    lead.emailSent ? 'Yes' : 'No',
    lead.raffleEntry?.isWinner ? `Yes - Place ${lead.raffleEntry.place}` : 'No',
    lead.raffleEntry?.prize || '',
    new Date(lead.createdAt).toLocaleString('en-PK'),
  ])

  return { headers, rows }
}

function toCsv(leads) {
  const { headers, rows } = exportRows(leads)
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
}

function htmlCell(value) {
  return (value == null ? '' : String(value))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function toExcelHtml(leads) {
  const { headers, rows } = exportRows(leads)
  const tableRows = [headers, ...rows]
    .map((row, rowIndex) => {
      const tag = rowIndex === 0 ? 'th' : 'td'
      return `<tr>${row.map((cell) => `<${tag} class="text">${htmlCell(cell)}</${tag}>`).join('')}</tr>`
    })
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }
    th { background: #eaf2f1; font-weight: 700; }
    th, td { border: 1px solid #cfd8d6; padding: 6px 8px; }
    .text { mso-number-format: "\\@"; }
  </style>
</head>
<body>
  <table>${tableRows}</table>
</body>
</html>`
}

export async function GET(request) {
  const auth = verifyAdminRequest(request, 'crm')
  if (!auth.ok) return auth.response

  const { searchParams } = request.nextUrl
  const q = (searchParams.get('q') || '').trim()
  const where = buildWhere(q)
  const prisma = getPrisma()

  try {
    if (searchParams.get('format') === 'csv') {
      const leads = await prisma.lead.findMany({
        where,
        include: { raffleEntry: true },
        orderBy: { createdAt: 'desc' },
      })
      return new Response(toCsv(leads), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="ARD_Leads_All_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      })
    }

    if (searchParams.get('format') === 'xls') {
      const leads = await prisma.lead.findMany({
        where,
        include: { raffleEntry: true },
        orderBy: { createdAt: 'desc' },
      })
      return new Response(toExcelHtml(leads), {
        headers: {
          'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
          'Content-Disposition': `attachment; filename="ARD_Entries_All_${new Date().toISOString().slice(0, 10)}.xls"`,
        },
      })
    }

    const limit = clampInt(searchParams.get('limit'), 1, 200, 50)
    const offset = clampInt(searchParams.get('offset'), 0, Number.MAX_SAFE_INTEGER, 0)

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: { raffleEntry: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.lead.count({ where }),
    ])

    return json({ success: true, data: leads, total, limit, offset })
  } catch (err) {
    logger.error('Admin leads fetch failed:', err)
    return error('Failed to fetch leads', 500)
  }
}

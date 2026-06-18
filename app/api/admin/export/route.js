import { getPrisma } from '@/lib/prisma'
import { error } from '@/lib/http'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { todayStr } from '@/lib/date'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

function csvCell(value) {
  const text = value == null ? '' : String(value)
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export async function GET(request) {
  const auth = verifyAdminRequest(request)
  if (!auth.ok) return auth.response

  const date = request.nextUrl.searchParams.get('date') || todayStr()
  const dateStart = new Date(`${date}T00:00:00Z`)
  const dateEnd = new Date(`${date}T23:59:59Z`)

  try {
    const leads = await getPrisma().lead.findMany({
      where: { createdAt: { gte: dateStart, lte: dateEnd } },
      include: { raffleEntry: true },
      orderBy: { createdAt: 'asc' },
    })

    const headers = [
      'Entry #',
      'Name',
      'Phone',
      'Email',
      'Interest',
      'Delivery',
      'Source',
      'Winner',
      'Prize',
      'Registered At',
    ]

    const rows = leads.map((lead) => [
      lead.raffleEntry?.entryNum || '',
      lead.name,
      lead.phone,
      lead.email || '',
      lead.interest || '',
      lead.delivery === 'wa' ? 'WhatsApp' : 'Email',
      lead.source,
      lead.raffleEntry?.isWinner ? `Yes - Place ${lead.raffleEntry.place}` : 'No',
      lead.raffleEntry?.prize || '',
      new Date(lead.createdAt).toLocaleString('en-PK'),
    ])

    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="ARD_Leads_${date}.csv"`,
      },
    })
  } catch (err) {
    logger.error('Export failed:', err)
    return error('Export failed', 500)
  }
}

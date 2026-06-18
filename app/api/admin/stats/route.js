import { getPrisma } from '@/lib/prisma'
import { json, error } from '@/lib/http'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { todayStr } from '@/lib/date'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

export async function GET(request) {
  const auth = verifyAdminRequest(request)
  if (!auth.ok) return auth.response

  const prisma = getPrisma()
  const today = todayStr()
  const todayStart = new Date(`${today}T00:00:00Z`)
  const todayEnd = new Date(`${today}T23:59:59Z`)

  try {
    const [
      totalLeads,
      todayLeads,
      totalEntries,
      todayEntries,
      winners,
      drawEvent,
      interestBreakdown,
      deliveryBreakdown,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
      prisma.raffleEntry.count(),
      prisma.raffleEntry.count({ where: { eventDate: today } }),
      prisma.raffleEntry.findMany({
        where: { isWinner: true, eventDate: today },
        include: { lead: { select: { name: true, phone: true } } },
        orderBy: { place: 'asc' },
      }),
      prisma.drawEvent.findUnique({ where: { eventDate: today } }),
      prisma.lead.groupBy({
        by: ['interest'],
        _count: { interest: true },
        orderBy: { _count: { interest: 'desc' } },
      }),
      prisma.lead.groupBy({
        by: ['delivery'],
        _count: { delivery: true },
      }),
    ])

    return json({
      success: true,
      data: {
        overview: {
          totalLeads,
          todayLeads,
          totalEntries,
          todayEntries,
          drawStatus: drawEvent?.status || 'no_event',
        },
        winners: winners.map((winner) => ({
          place: winner.place,
          prize: winner.prize,
          name: winner.lead.name,
          phone: winner.lead.phone,
          drawnAt: winner.drawnAt,
        })),
        prizes: {
          first: drawEvent?.prize1 || 'ARD Developers Gift Hamper',
          second: drawEvent?.prize2 || 'ARD City Merchandise Set',
          third: drawEvent?.prize3 || 'ARD Branded Accessory',
        },
        breakdown: {
          byInterest: interestBreakdown.map((item) => ({
            interest: item.interest || 'Not specified',
            count: item._count.interest,
          })),
          byDelivery: deliveryBreakdown.map((item) => ({
            type: item.delivery === 'wa' ? 'WhatsApp' : 'Email',
            count: item._count.delivery,
          })),
        },
      },
    })
  } catch (err) {
    logger.error('Stats fetch failed:', err)
    return error('Failed to fetch stats', 500)
  }
}

import { getPrisma } from '@/lib/prisma'
import { json, error } from '@/lib/http'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { todayStr } from '@/lib/date'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

// Lightweight counts for the lucky-draw operator dashboard. Raffle-scoped so the
// draw page does not need a CRM token (see /api/admin/stats for the full CRM view).
export async function GET(request) {
  const auth = verifyAdminRequest(request, 'raffle')
  if (!auth.ok) return auth.response

  const prisma = getPrisma()
  const today = todayStr()

  try {
    const [totalLeads, totalEntries, todayEntries] = await Promise.all([
      prisma.lead.count(),
      prisma.raffleEntry.count(),
      prisma.raffleEntry.count({ where: { eventDate: today } }),
    ])

    return json({
      success: true,
      data: { overview: { totalLeads, totalEntries, todayEntries } },
    })
  } catch (err) {
    logger.error('Raffle stats fetch failed:', err)
    return error('Failed to fetch stats', 500)
  }
}

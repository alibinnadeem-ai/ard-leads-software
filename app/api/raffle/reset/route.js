import { getPrisma } from '@/lib/prisma'
import { json, error, readJson } from '@/lib/http'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { todayStr } from '@/lib/date'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

export async function POST(request) {
  const auth = verifyAdminRequest(request)
  if (!auth.ok) return auth.response

  const body = await readJson(request)
  const date = body.date || todayStr()
  const prisma = getPrisma()

  try {
    const drawEvent = await prisma.drawEvent.findUnique({ where: { eventDate: date } })
    if (drawEvent) {
      const winnerIds = [drawEvent.winner1Id, drawEvent.winner2Id, drawEvent.winner3Id].filter(Boolean)
      if (winnerIds.length > 0) {
        await prisma.raffleEntry.updateMany({
          where: { leadId: { in: winnerIds } },
          data: { isWinner: false, place: null, prize: null, drawnAt: null },
        })
      }
    }

    await prisma.drawEvent.update({
      where: { eventDate: date },
      data: {
        status: 'open',
        winner1Id: null,
        winner2Id: null,
        winner3Id: null,
        startedAt: null,
        completedAt: null,
      },
    })

    logger.info(`Draw reset for ${date}`)
    return json({ success: true, message: `Draw reset for ${date}. All entries remain.` })
  } catch (err) {
    logger.error('Reset failed:', err)
    return error('Reset failed', 500)
  }
}

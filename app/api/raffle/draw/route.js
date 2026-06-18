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
    if (!drawEvent) return error('No draw event found for this date', 404)

    const existingWinners = await prisma.raffleEntry.count({
      where: { eventDate: date, isWinner: true },
    })

    if (existingWinners >= 3) return error('All 3 winners have already been drawn', 400)
    if (drawEvent.status === 'complete') return error('Draw is already complete', 400)

    const place = existingWinners + 1
    const prizeMap = { 1: drawEvent.prize1, 2: drawEvent.prize2, 3: drawEvent.prize3 }
    const prize = prizeMap[place]

    const pool = await prisma.raffleEntry.findMany({
      where: { eventDate: date, isWinner: false },
      include: { lead: true },
    })

    if (pool.length === 0) return error('No eligible entries remaining', 400)

    const winner = pool[Math.floor(Math.random() * pool.length)]
    const updatedEntry = await prisma.raffleEntry.update({
      where: { id: winner.id },
      data: { isWinner: true, place, prize, drawnAt: new Date() },
      include: { lead: true },
    })

    const updateData = { status: place < 3 ? 'drawing' : 'complete' }
    if (place === 1) {
      updateData.winner1Id = winner.leadId
      updateData.startedAt = new Date()
    }
    if (place === 2) updateData.winner2Id = winner.leadId
    if (place === 3) {
      updateData.winner3Id = winner.leadId
      updateData.completedAt = new Date()
    }

    await prisma.drawEvent.update({ where: { eventDate: date }, data: updateData })

    logger.info(`Winner drawn: ${winner.lead.name} - Place ${place} - ${prize}`)

    return json({
      success: true,
      data: {
        place,
        prize,
        winner: {
          entryId: winner.id,
          entryNum: winner.entryNum,
          leadId: winner.leadId,
          name: updatedEntry.lead.name,
          phone: updatedEntry.lead.phone,
          interest: updatedEntry.lead.interest,
          drawnAt: updatedEntry.drawnAt,
        },
        remainingEntries: pool.length - 1,
        drawComplete: place === 3,
      },
      message: `${updatedEntry.lead.name} wins ${prize}!`,
    })
  } catch (err) {
    logger.error('Draw failed:', err)
    return error('Draw failed. Please try again.', 500)
  }
}

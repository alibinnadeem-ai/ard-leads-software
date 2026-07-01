import { getPrisma } from '@/lib/prisma'
import { json, error } from '@/lib/http'
import { verifyAdminRequest } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function DELETE(request, context) {
  const auth = verifyAdminRequest(request, 'raffle')
  if (!auth.ok) return auth.response

  const { id } = await context.params
  const prisma = getPrisma()

  try {
    const entry = await prisma.raffleEntry.findUnique({ where: { id } })
    if (!entry) return error('Entry not found', 404)
    if (entry.isWinner) return error('Cannot remove a winner', 400)

    await prisma.raffleEntry.delete({ where: { id } })
    const totalEntries = await prisma.raffleEntry.count({ where: { eventDate: entry.eventDate } })

    await prisma.drawEvent.update({
      where: { eventDate: entry.eventDate },
      data: { totalEntries },
    })

    return json({ success: true, message: 'Entry removed' })
  } catch {
    return error('Failed to remove entry', 500)
  }
}

import { getPrisma } from '@/lib/prisma'
import { json, error } from '@/lib/http'
import { todayStr } from '@/lib/date'
import { maskPhone } from '@/lib/validation'

export const runtime = 'nodejs'

export async function GET(request) {
  const date = request.nextUrl.searchParams.get('date') || todayStr()

  try {
    const winners = await getPrisma().raffleEntry.findMany({
      where: { eventDate: date, isWinner: true },
      include: { lead: { select: { name: true, phone: true, interest: true } } },
      orderBy: { place: 'asc' },
    })

    return json({
      success: true,
      data: winners.map((winner) => ({
        place: winner.place,
        prize: winner.prize,
        name: winner.lead.name,
        phone: maskPhone(winner.lead.phone),
        drawnAt: winner.drawnAt,
      })),
    })
  } catch {
    return error('Failed to fetch winners', 500)
  }
}

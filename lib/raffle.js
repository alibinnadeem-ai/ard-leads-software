import { getPrisma } from './prisma'
import { todayStr } from './date'
import { maskPhone } from './validation'

export const defaultPrizes = {
  first: 'ARD Developers Gift Hamper',
  second: 'ARD City Merchandise Set',
  third: 'ARD Branded Accessory',
}

function emptyPool(date) {
  return {
    eventDate: date,
    totalEntries: 0,
    drawStatus: 'open',
    prizes: defaultPrizes,
    entries: [],
  }
}

export async function getPool(date = todayStr()) {
  if (!process.env.DATABASE_URL) return emptyPool(date)

  const prisma = getPrisma()
  const where = date === 'all' ? {} : { eventDate: date }

  const [entries, drawEvent] = await Promise.all([
    prisma.raffleEntry.findMany({
      where,
      include: {
        lead: { select: { id: true, name: true, phone: true, interest: true } },
      },
      orderBy: { entryNum: 'asc' },
    }),
    prisma.drawEvent.findUnique({ where: { eventDate: date === 'all' ? todayStr() : date } }),
  ])

  return {
    eventDate: date,
    totalEntries: entries.length,
    drawStatus: drawEvent?.status || 'open',
    prizes: {
      first: drawEvent?.prize1 || defaultPrizes.first,
      second: drawEvent?.prize2 || defaultPrizes.second,
      third: drawEvent?.prize3 || defaultPrizes.third,
    },
    entries: entries.map((entry) => ({
      id: entry.id,
      leadId: entry.lead.id,
      entryNum: entry.entryNum,
      name: entry.lead.name,
      phone: maskPhone(entry.lead.phone),
      rawPhone: entry.lead.phone,
      interest: entry.lead.interest,
      isWinner: entry.isWinner,
      place: entry.place,
      prize: entry.prize,
    })),
  }
}

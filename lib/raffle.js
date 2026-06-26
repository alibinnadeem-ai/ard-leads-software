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
  const where = {}

  const [entries, drawEvent] = await Promise.all([
    prisma.raffleEntry.findMany({
      where,
      include: {
        lead: { select: { id: true, name: true, phone: true, interest: true } },
      },
      orderBy: { entryNum: 'asc' },
    }),
    prisma.drawEvent.findUnique({ where: { eventDate: todayStr() } }),
  ])

  return {
    eventDate: todayStr(),
    totalEntries: entries.length,
    drawStatus: drawEvent?.status || 'open',
    prizes: {
      first: drawEvent?.prize1 || defaultPrizes.first,
      second: drawEvent?.prize2 || defaultPrizes.second,
      third: drawEvent?.prize3 || defaultPrizes.third,
    },
    entries: entries.map((entry) => {
      const isWinnerOfToday = drawEvent && (
        entry.leadId === drawEvent.winner1Id ||
        entry.leadId === drawEvent.winner2Id ||
        entry.leadId === drawEvent.winner3Id
      );

      let place = null;
      let prize = null;
      if (drawEvent) {
        if (entry.leadId === drawEvent.winner1Id) { place = 1; prize = drawEvent.prize1; }
        else if (entry.leadId === drawEvent.winner2Id) { place = 2; prize = drawEvent.prize2; }
        else if (entry.leadId === drawEvent.winner3Id) { place = 3; prize = drawEvent.prize3; }
      }

      return {
        id: entry.id,
        leadId: entry.lead.id,
        entryNum: entry.entryNum,
        name: entry.lead.name,
        phone: maskPhone(entry.lead.phone),
        rawPhone: entry.lead.phone,
        interest: entry.lead.interest,
        isWinner: isWinnerOfToday,
        isEligible: !entry.isWinner || isWinnerOfToday,
        place,
        prize,
      };
    }),
  }
}

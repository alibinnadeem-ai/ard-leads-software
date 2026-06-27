const { PrismaClient } = require('@prisma/client')
const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return
  dotenv.config({ path: file })
}

loadEnvFile(path.join(process.cwd(), '.env'))
loadEnvFile(path.join(process.cwd(), '.env.local'))

const prisma = new PrismaClient()

async function testReset() {
  const date = new Date().toISOString().split('T')[0]
  console.log('Resetting date:', date)
  try {
    const drawEvent = await prisma.drawEvent.findUnique({ where: { eventDate: date } })
    console.log('Found DrawEvent:', drawEvent)
    
    if (drawEvent) {
      const winnerIds = [drawEvent.winner1Id, drawEvent.winner2Id, drawEvent.winner3Id].filter(Boolean)
      console.log('Winner IDs to reset:', winnerIds)
      
      if (winnerIds.length > 0) {
        const updateRes = await prisma.raffleEntry.updateMany({
          where: { leadId: { in: winnerIds } },
          data: { isWinner: false, place: null, prize: null, drawnAt: null },
        })
        console.log('RaffleEntry update result:', updateRes)
      }
    }

    const eventUpdateRes = await prisma.drawEvent.update({
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
    console.log('DrawEvent update result:', eventUpdateRes)
    console.log('Reset completed successfully!')
  } catch (err) {
    console.error('Reset error:', err)
  }
}

testReset().finally(() => prisma.$disconnect())

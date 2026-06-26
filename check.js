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

async function check() {
  const today = new Date().toISOString().split('T')[0]
  
  const drawEvent = await prisma.drawEvent.findUnique({
    where: { eventDate: today }
  })
  console.log('Today DrawEvent:', drawEvent)

  const todayWinners = await prisma.raffleEntry.findMany({
    where: { eventDate: today, isWinner: true }
  })
  console.log('Today Winners count:', todayWinners.length)
  console.log('Today Winners:', todayWinners)
}

check().finally(() => prisma.$disconnect())

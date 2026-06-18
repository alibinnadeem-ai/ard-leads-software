const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const today = new Date().toISOString().split('T')[0]

  console.log(`\nSeeding ARD Event Platform - ${today}\n`)

  const drawEvent = await prisma.drawEvent.upsert({
    where: { eventDate: today },
    update: {},
    create: {
      eventDate: today,
      eventName: 'ARD Developers Event 2025',
      status: 'open',
      prize1: 'ARD Developers Gift Hamper',
      prize2: 'ARD City Merchandise Set',
      prize3: 'ARD Branded Accessory',
    },
  })
  console.log('Draw event:', drawEvent.eventDate, '-', drawEvent.status)

  const sampleLeads = [
    { name: 'Ahmed Raza', phone: '+92 300 1234567', email: 'ahmed@example.com', interest: 'GZL Residentials', delivery: 'wa' },
    { name: 'Sara Malik', phone: '+92 311 9876543', email: 'sara@example.com', interest: 'Qantara Commercials', delivery: 'em' },
    { name: 'Bilal Hussain', phone: '+92 321 4567890', email: null, interest: 'ARD Marina Commercials', delivery: 'wa' },
    { name: 'Zainab Khan', phone: '+92 333 6543210', email: 'zainab@example.com', interest: 'GZL Residentials', delivery: 'wa' },
    { name: 'Usman Ali', phone: '+92 345 1122334', email: null, interest: 'Qantara Commercials', delivery: 'wa' },
    { name: 'Fatima Sheikh', phone: '+92 301 9988776', email: 'fatima@example.com', interest: 'ARD Marina Commercials', delivery: 'em' },
  ]

  let created = 0
  for (const leadData of sampleLeads) {
    try {
      const existing = await prisma.lead.findFirst({ where: { phone: leadData.phone } })
      if (existing) {
        console.log(`  Skipped (exists): ${leadData.name}`)
        continue
      }

      const lead = await prisma.lead.create({
        data: { ...leadData, source: 'Seed Data', event: 'ARD Developers Event 2025' },
      })

      const count = await prisma.raffleEntry.count({ where: { eventDate: today } })
      await prisma.raffleEntry.create({
        data: { leadId: lead.id, eventDate: today, entryNum: count + 1 },
      })

      await prisma.drawEvent.update({
        where: { eventDate: today },
        data: { totalEntries: { increment: 1 } },
      })

      console.log(`  Created: ${lead.name} - Entry #${count + 1}`)
      created++
    } catch (err) {
      console.error(`  Failed: ${leadData.name}:`, err.message)
    }
  }

  const totalLeads = await prisma.lead.count()
  const todayEntries = await prisma.raffleEntry.count({ where: { eventDate: today } })
  const drawStatus = await prisma.drawEvent.findUnique({ where: { eventDate: today } })

  console.log('\nSummary:')
  console.log(`   Total leads in DB:   ${totalLeads}`)
  console.log(`   Today's entries:     ${todayEntries}`)
  console.log(`   Draw status:         ${drawStatus?.status}`)
  console.log(`   New leads created:   ${created}`)
  console.log('\nSeed complete!\n')
}

main()
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(async () => prisma.$disconnect())

import { getPrisma } from '@/lib/prisma'
import { json, error, readJson, requestIp, appUrl } from '@/lib/http'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { todayStr } from '@/lib/date'
import { validateLead } from '@/lib/validation'
import { logger } from '@/lib/logger'
import { createTask } from '@/lib/services/clickup'
import { send as sendZapier } from '@/lib/services/zapier'
import { sendBrochure } from '@/lib/services/email'
import { sendBrochureLink } from '@/lib/services/whatsapp'

export const runtime = 'nodejs'

export async function POST(request) {
  const ip = requestIp(request)
  const leadLimit = checkRateLimit(`lead:${ip}`, { windowMs: 60 * 1000, max: 5 })

  if (!leadLimit.ok) {
    return error('Too many submissions. Please slow down.', 429)
  }

  const body = await readJson(request)
  const validation = validateLead(body)

  if (!validation.valid) {
    return json({ success: false, errors: validation.errors }, { status: 400 })
  }

  const prisma = getPrisma()
  const date = todayStr()
  const backendUrl = appUrl(request)

  try {
    const { lead, raffleEntry } = await prisma.$transaction(async (tx) => {
      const createdLead = await tx.lead.create({
        data: {
          ...validation.data,
          ipAddress: ip,
          userAgent: request.headers.get('user-agent')?.substring(0, 255),
        },
      })

      const todayCount = await tx.raffleEntry.count({ where: { eventDate: date } })
      const createdEntry = await tx.raffleEntry.create({
        data: {
          leadId: createdLead.id,
          eventDate: date,
          entryNum: todayCount + 1,
        },
      })

      await tx.drawEvent.upsert({
        where: { eventDate: date },
        update: { totalEntries: { increment: 1 } },
        create: { eventDate: date, totalEntries: 1 },
      })

      return { lead: createdLead, raffleEntry: createdEntry }
    })

    const leadWithEntry = { ...lead, raffleEntry }

    const integrations = await Promise.allSettled([
      createTask(leadWithEntry),
      sendZapier(leadWithEntry, backendUrl),
      lead.delivery === 'em' && lead.email
        ? sendBrochure(leadWithEntry, backendUrl)
        : Promise.resolve({ skipped: true }),
      lead.delivery === 'wa'
        ? sendBrochureLink(leadWithEntry, backendUrl)
        : Promise.resolve({ skipped: true }),
    ])

    const [cuResult, zapResult, emailResult, waResult] = integrations
    const integrationStatus = {
      clickup: cuResult.status,
      zapier: zapResult.status,
      email: emailResult.status,
      whatsapp: waResult.status,
    }

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        clickupTaskId: cuResult.status === 'fulfilled' ? cuResult.value?.id || null : null,
        zapierSent: zapResult.status === 'fulfilled' && !zapResult.value?.skipped,
        emailSent: emailResult.status === 'fulfilled' && !emailResult.value?.skipped,
        whatsappSent: waResult.status === 'fulfilled' && !waResult.value?.skipped,
      },
    })

    logger.info(`Lead created: ${lead.id} - ${lead.name} (${lead.phone})`)

    return json(
      {
        success: true,
        data: {
          leadId: lead.id,
          entryId: raffleEntry.id,
          entryNumber: raffleEntry.entryNum,
          eventDate: date,
          integrations: integrationStatus,
          lead: {
            id: lead.id,
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            delivery: lead.delivery,
            interest: lead.interest,
            source: lead.source,
            event: lead.event,
          },
        },
        message: `Welcome ${lead.name}! You are entry #${raffleEntry.entryNum} in today's draw.`,
      },
      { status: 201 }
    )
  } catch (err) {
    logger.error('Lead creation failed:', err)
    return error('Failed to save lead. Please try again.', 500)
  }
}

export async function GET(request) {
  const auth = verifyAdminRequest(request)
  if (!auth.ok) return auth.response

  const prisma = getPrisma()
  const { searchParams } = request.nextUrl
  const date = searchParams.get('date')
  const limit = Number.parseInt(searchParams.get('limit') || '50', 10)
  const offset = Number.parseInt(searchParams.get('offset') || '0', 10)
  const today = todayStr()

  try {
    const where = date
      ? {
          createdAt: {
            gte: new Date(`${date}T00:00:00Z`),
            lt: new Date(new Date(`${date}T00:00:00Z`).getTime() + 86400000),
          },
        }
      : { createdAt: { gte: new Date(`${today}T00:00:00Z`) } }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: { raffleEntry: true },
        orderBy: { createdAt: 'desc' },
        take: Number.isFinite(limit) ? limit : 50,
        skip: Number.isFinite(offset) ? offset : 0,
      }),
      prisma.lead.count({ where }),
    ])

    return json({
      success: true,
      data: leads,
      total,
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0,
    })
  } catch (err) {
    logger.error('Failed to fetch leads:', err)
    return error('Failed to fetch leads', 500)
  }
}

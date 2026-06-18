import { getPrisma } from '@/lib/prisma'
import { json, readJson } from '@/lib/http'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

export async function POST(request) {
  const body = await readJson(request)
  logger.info('Zapier webhook received:', JSON.stringify(body).substring(0, 200))

  const { leadId, status } = body

  if (leadId && status === 'processed') {
    try {
      await getPrisma().lead.update({
        where: { id: leadId },
        data: { zapierSent: true },
      })
      await getPrisma().integrationLog.create({
        data: { leadId, type: 'zapier', status: 'success', response: JSON.stringify(body) },
      })
    } catch (err) {
      logger.error('Zapier webhook processing error:', err)
    }
  }

  return json({ received: true })
}

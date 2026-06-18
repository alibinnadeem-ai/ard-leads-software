import { getPrisma } from '@/lib/prisma'
import { json, readJson } from '@/lib/http'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

export async function POST(request) {
  const body = await readJson(request)
  logger.info('ClickUp webhook received:', JSON.stringify(body).substring(0, 200))

  const { event, task_id, history_items } = body

  if (task_id) {
    try {
      await getPrisma().integrationLog.create({
        data: {
          leadId: 'clickup_event',
          type: 'clickup',
          status: 'success',
          response: JSON.stringify({ event, task_id, items: history_items?.length }),
        },
      })
    } catch (err) {
      logger.error('ClickUp webhook processing error:', err)
    }
  }

  return json({ received: true })
}

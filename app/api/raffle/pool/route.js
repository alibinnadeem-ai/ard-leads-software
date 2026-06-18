import { json, error } from '@/lib/http'
import { getPool } from '@/lib/raffle'
import { todayStr } from '@/lib/date'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

export async function GET(request) {
  const date = request.nextUrl.searchParams.get('date') || todayStr()

  try {
    const data = await getPool(date)
    return json({ success: true, data })
  } catch (err) {
    logger.error('Failed to fetch pool:', err)
    return error('Failed to fetch pool', 500)
  }
}

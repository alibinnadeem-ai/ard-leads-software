import { getPrisma } from '@/lib/prisma'
import { json, error } from '@/lib/http'
import { verifyAdminRequest } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function GET(request) {
  const auth = verifyAdminRequest(request)
  if (!auth.ok) return auth.response

  try {
    const events = await getPrisma().drawEvent.findMany({
      orderBy: { eventDate: 'desc' },
      take: 30,
    })
    return json({ success: true, data: events })
  } catch {
    return error('Failed to fetch events', 500)
  }
}

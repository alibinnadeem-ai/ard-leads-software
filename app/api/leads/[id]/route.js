import { getPrisma } from '@/lib/prisma'
import { json, error } from '@/lib/http'
import { verifyAdminRequest } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function GET(request, context) {
  const auth = verifyAdminRequest(request)
  if (!auth.ok) return auth.response

  const { id } = await context.params

  try {
    const lead = await getPrisma().lead.findUnique({
      where: { id },
      include: { raffleEntry: true },
    })

    if (!lead) return error('Lead not found', 404)
    return json({ success: true, data: lead })
  } catch {
    return error('Failed to fetch lead', 500)
  }
}

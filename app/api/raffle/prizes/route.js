import { getPrisma } from '@/lib/prisma'
import { json, error, readJson } from '@/lib/http'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { todayStr } from '@/lib/date'
import { defaultPrizes } from '@/lib/raffle'

export const runtime = 'nodejs'

export async function PATCH(request) {
  const auth = verifyAdminRequest(request, 'raffle')
  if (!auth.ok) return auth.response

  const body = await readJson(request)
  const date = body.date || todayStr()
  const { prize1, prize2, prize3 } = body

  if (prize1 && String(prize1).length > 100) return error('Prize 1 must be 100 characters or fewer', 400)
  if (prize2 && String(prize2).length > 100) return error('Prize 2 must be 100 characters or fewer', 400)
  if (prize3 && String(prize3).length > 100) return error('Prize 3 must be 100 characters or fewer', 400)

  try {
    const updated = await getPrisma().drawEvent.upsert({
      where: { eventDate: date },
      update: {
        ...(prize1 && { prize1 }),
        ...(prize2 && { prize2 }),
        ...(prize3 && { prize3 }),
      },
      create: {
        eventDate: date,
        prize1: prize1 || defaultPrizes.first,
        prize2: prize2 || defaultPrizes.second,
        prize3: prize3 || defaultPrizes.third,
      },
    })

    return json({ success: true, data: updated })
  } catch {
    return error('Failed to update prizes', 500)
  }
}

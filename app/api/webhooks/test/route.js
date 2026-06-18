import { json } from '@/lib/http'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { todayStr } from '@/lib/date'
import { appUrl } from '@/lib/http'
import { createTask } from '@/lib/services/clickup'
import { send as sendZapier } from '@/lib/services/zapier'
import { sendBrochure } from '@/lib/services/email'

export const runtime = 'nodejs'

export async function GET(request) {
  const auth = verifyAdminRequest(request)
  if (!auth.ok) return auth.response

  const testLead = {
    id: `test-${Date.now()}`,
    name: 'Test Lead',
    phone: '+92 300 0000000',
    email: process.env.SMTP_USER,
    delivery: 'em',
    interest: 'GZL Residentials',
    source: 'Integration Test',
    event: 'ARD Developers Event 2025',
    createdAt: new Date(),
    raffleEntry: { entryNum: 999, eventDate: todayStr() },
  }

  const backendUrl = appUrl(request)
  const results = await Promise.allSettled([
    createTask(testLead),
    sendZapier(testLead, backendUrl),
    sendBrochure(testLead, backendUrl),
  ])

  const [clickup, zapier, email] = results

  return json({
    success: true,
    results: {
      clickup: { status: clickup.status, data: clickup.value || clickup.reason?.message },
      zapier: { status: zapier.status, data: zapier.value || zapier.reason?.message },
      email: { status: email.status, data: email.value || email.reason?.message },
    },
  })
}

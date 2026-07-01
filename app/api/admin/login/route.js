import { json, error, readJson, requestIp } from '@/lib/http'
import { createAdminToken, validateAdminPin } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

export async function POST(request) {
  const { pin, scope } = await readJson(request)
  const role = scope === 'raffle' ? 'raffle' : 'crm'

  if (!pin || pin.length < 4) return error('Password must be at least 4 characters', 400)

  if (!validateAdminPin(pin, role)) {
    logger.warn(`Failed ${role} login attempt from ${requestIp(request)}`)
    return error('Incorrect PIN', 401)
  }

  logger.info(`${role} login from ${requestIp(request)}`)
  return json({
    success: true,
    token: createAdminToken(pin, role),
    message: 'Admin access granted',
    expiresIn: '12h',
  })
}

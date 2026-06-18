import { json, error, readJson, requestIp } from '@/lib/http'
import { createAdminToken, validateAdminPin } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

export async function POST(request) {
  const { pin } = await readJson(request)

  if (!pin || pin.length < 4) return error('Password must be at least 4 characters', 400)

  if (!validateAdminPin(pin)) {
    logger.warn(`Failed admin login attempt from ${requestIp(request)}`)
    return error('Incorrect PIN', 401)
  }

  logger.info(`Admin login from ${requestIp(request)}`)
  return json({
    success: true,
    token: createAdminToken(pin),
    message: 'Admin access granted',
    expiresIn: '12h',
  })
}

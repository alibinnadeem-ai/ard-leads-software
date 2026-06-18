import { error } from './http'
import { logger } from './logger'

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000

function adminPin() {
  return process.env.ADMIN_PIN || '2025'
}

export function createAdminToken(pin) {
  return Buffer.from(`${pin}:${Date.now()}`).toString('base64')
}

export function verifyAdminRequest(request) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      ok: false,
      response: error('Authorization header required. Format: Bearer <token>', 401),
    }
  }

  const token = authHeader.substring(7)

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [pin, ts] = decoded.split(':')

    if (pin !== adminPin()) {
      logger.warn('Invalid admin token')
      return { ok: false, response: error('Invalid admin token', 403) }
    }

    const tokenAge = Date.now() - Number.parseInt(ts || '0', 10)
    if (Number.isNaN(tokenAge) || tokenAge > TOKEN_TTL_MS) {
      return { ok: false, response: error('Token expired. Please login again.', 401) }
    }

    return { ok: true }
  } catch (err) {
    logger.warn(`Token decode failed: ${err.message}`)
    return { ok: false, response: error('Invalid token format', 403) }
  }
}

export function validateAdminPin(pin) {
  return pin === adminPin()
}

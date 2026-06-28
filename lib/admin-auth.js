import { error } from './http'
import { logger } from './logger'

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000

// Each role has its own independent secret. A token minted for one role is
// rejected by endpoints that require the other role.
const SECRETS = {
  crm: () => process.env.ADMIN_PIN,
  raffle: () => process.env.RAFFLE_PIN,
}

function normalizeRole(role) {
  return role === 'raffle' ? 'raffle' : 'crm'
}

export function createAdminToken(pin, role = 'crm') {
  return Buffer.from(`${normalizeRole(role)}:${pin}:${Date.now()}`).toString('base64')
}

export function validateAdminPin(pin, role = 'crm') {
  const secret = SECRETS[normalizeRole(role)]()
  return Boolean(secret) && pin === secret
}

export function verifyAdminRequest(request, role = 'crm') {
  const requiredRole = normalizeRole(role)
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
    // Token format: "<role>:<pin>:<timestamp>". The pin may contain ':',
    // so take the first part as role, the last as timestamp, the rest as pin.
    const parts = decoded.split(':')
    if (parts.length < 3) {
      logger.warn('Invalid admin token')
      return { ok: false, response: error('Invalid admin token', 403) }
    }

    const tokenRole = parts[0]
    const ts = parts[parts.length - 1]
    const pin = parts.slice(1, -1).join(':')

    if (tokenRole !== requiredRole || !validateAdminPin(pin, requiredRole)) {
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

const buckets = new Map()

export function checkRateLimit(key, { windowMs, max }) {
  const now = Date.now()
  const item = buckets.get(key)

  if (!item || now > item.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: max - 1 }
  }

  item.count += 1

  if (item.count > max) {
    return { ok: false, remaining: 0, resetAt: item.resetAt }
  }

  return { ok: true, remaining: Math.max(0, max - item.count) }
}

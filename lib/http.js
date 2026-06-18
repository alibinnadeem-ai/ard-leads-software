import { NextResponse } from 'next/server'

export function json(data, init) {
  return NextResponse.json(data, init)
}

export function error(message, status = 500, extra = {}) {
  return json({ success: false, error: message, ...extra }, { status })
}

export async function readJson(request) {
  try {
    return await request.json()
  } catch {
    return {}
  }
}

export function requestIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export function appUrl(request) {
  return (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    request?.nextUrl?.origin ||
    'http://localhost:3000'
  )
}

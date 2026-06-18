export function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function dateRange(date) {
  const start = new Date(`${date}T00:00:00Z`)
  const end = new Date(`${date}T23:59:59Z`)

  return { start, end }
}

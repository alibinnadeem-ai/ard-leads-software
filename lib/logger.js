function write(level, message, meta) {
  const payload = meta === undefined ? '' : ` ${safeStringify(meta)}`
  const line = `${new Date().toISOString()} [${level}] ${message}${payload}`

  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

function safeStringify(value) {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export const logger = {
  info(message, meta) {
    write('info', message, meta)
  },
  warn(message, meta) {
    write('warn', message, meta)
  },
  error(message, meta) {
    write('error', message, meta?.stack || meta)
  },
}

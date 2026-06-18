const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const dotenv = require('dotenv')

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return
  dotenv.config({ path: file })
}

loadEnvFile(path.join(process.cwd(), '.env'))
loadEnvFile(path.join(process.cwd(), '.env.local'))

if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.delete('channel_binding')
  process.env.DATABASE_URL = url.toString()
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ard-prisma-'))
const tempSchema = path.join(tempDir, 'schema.prisma')
const schema = fs.readFileSync(path.join(process.cwd(), 'prisma/schema.prisma'), 'utf8')
fs.writeFileSync(tempSchema, schema)

const result = spawnSync('npx', ['prisma', 'db', 'push', '--schema', tempSchema, '--skip-generate'], {
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
})

fs.rmSync(tempDir, { recursive: true, force: true })

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

const generate = spawnSync('npx', ['prisma', 'generate'], {
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
})

process.exit(generate.status ?? 1)

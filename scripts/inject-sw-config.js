import fs from 'fs'
import path from 'path'

function loadDotEnv() {
  const envPath = path.resolve('.env')
  if (!fs.existsSync(envPath)) return {}
  const content = fs.readFileSync(envPath, 'utf-8')
  const out = {}
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (m) out[m[1]] = (m[2] || '').trim().replace(/^['"]|['"]$/g, '')
  }
  return out
}

const dotenv = loadDotEnv()
const SHEET_API_URL = process.env.VITE_SHEET_API_URL || dotenv.VITE_SHEET_API_URL || ''

if (!SHEET_API_URL) {
  console.warn(
    '[inject-sw-config] VITE_SHEET_API_URL is not set — the "ทำแล้ว" notification button will not be able to update the sheet until you set it.'
  )
}

const template = fs.readFileSync('src/sw-template.js', 'utf-8')
const output = template.replace('__SHEET_API_URL__', SHEET_API_URL)

fs.mkdirSync('public', { recursive: true })
fs.writeFileSync('public/sw.js', output)
console.log('[inject-sw-config] wrote public/sw.js')

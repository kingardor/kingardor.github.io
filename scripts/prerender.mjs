/**
 * prerender.mjs — build-time HTML snapshot for SEO
 *
 * Requires PUPPETEER_EXECUTABLE_PATH env var pointing to a modern Chrome/Chromium.
 * In GitHub Actions this is provided by browser-actions/setup-chrome.
 * Locally you can skip this script — it only matters for the production deploy.
 *
 * Usage:
 *   PUPPETEER_EXECUTABLE_PATH=/path/to/chrome node scripts/prerender.mjs
 */

import puppeteer from 'puppeteer-core'
import { createServer } from 'http'
import { createReadStream, writeFileSync, existsSync } from 'fs'
import { join, extname, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, '..', 'dist')
const WAIT_MS = 3500   // covers 1.7 s loader minimum + React render
const PORT = 45679

// ── Sanity checks ────────────────────────────────────────────────────────────

const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
if (!executablePath) {
  console.warn('⚠️  PUPPETEER_EXECUTABLE_PATH not set — skipping prerender.')
  process.exit(0)
}

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('❌  dist/index.html not found. Run npm run build first.')
  process.exit(1)
}

// ── Minimal static file server ────────────────────────────────────────────────

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.css':  'text/css',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.txt':  'text/plain',
  '.xml':  'application/xml',
}

const server = createServer((req, res) => {
  let url = req.url.split('?')[0]
  if (url === '/') url = '/index.html'
  const file = join(DIST, url)
  if (!existsSync(file)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    createReadStream(join(DIST, 'index.html')).pipe(res)
    return
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' })
  createReadStream(file).pipe(res)
})

await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve))
console.log(`🌐  Serving dist on http://127.0.0.1:${PORT}`)

// ── Puppeteer snapshot ────────────────────────────────────────────────────────

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl'],
})

try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })

  // Log page errors as warnings (non-fatal)
  page.on('pageerror', err => console.warn('  ⚠️  page error (non-fatal):', err.message.slice(0, 120)))

  await page.goto(`http://127.0.0.1:${PORT}/`, {
    waitUntil: 'networkidle0',
    timeout: 30_000,
  })

  // Wait for loader to dismiss and React to fully render
  await new Promise(resolve => setTimeout(resolve, WAIT_MS))

  const html = await page.content()
  writeFileSync(join(DIST, 'index.html'), html, 'utf8')
  console.log('✅  Pre-rendered / → dist/index.html')
} finally {
  await browser.close()
  server.close()
}

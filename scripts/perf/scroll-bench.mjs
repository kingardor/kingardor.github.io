/**
 * Scroll benchmark for the two editions: scrolls each page the way a person
 * would and reads Chrome's own frame reports, so a change that makes scrolling
 * janky shows up as numbers instead of a feeling.
 *
 *   npm run build && npm run bench                    # both editions, all profiles
 *   npm run bench -- --edition versus --profile phone
 *   npm run bench -- --idle                           # also: redraws while nobody scrolls
 *
 * Needs Chrome: PUPPETEER_EXECUTABLE_PATH, or the default macOS install.
 * Serves dist/ itself with `vite preview` on port 4199.
 *
 * Profiles (scripted gestures; Chrome's frame reports):
 *   no-gpu   1440x900 @2x, CPU 4x slower, software rendering (a laptop
 *            without graphics acceleration), mouse-wheel gestures
 *   phone    390x844 @3x, CPU 4x slower, software rendering, touch flings.
 *            Can't see a real phone GPU's limits; test on a device too.
 *   fast     1440x900 @2x, full speed, real GPU
 *
 * Columns, per second of scrolling 12,000 px (lower is better):
 *   dropped  frames the browser had to drop
 *   late     frames shown without the page's latest update (an index, not a
 *            count of visible stutters)
 *   busy     share of time the main thread was working
 *   style    ms of style recalculation      raster  ms redrawing image tiles
 *   passes   offscreen drawing passes per frame (blend modes, masks, filters)
 *   idle     redraws per second at the top of the page, 40 s after load
 * Results vary about 1-10% between runs: compare before/after on one machine.
 */
import puppeteer from 'puppeteer-core'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : fallback }
const EDITIONS = opt('edition', 'mint,versus').split(',')
const PROFILES = opt('profile', 'no-gpu,phone,fast').split(',')
const IDLE = args.includes('--idle')
const DISTANCE = 12000
const PORT = 4199
const BASE = `http://localhost:${PORT}`

const chrome = process.env.PUPPETEER_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
if (!existsSync(chrome)) { console.error(`Chrome not found at ${chrome}; set PUPPETEER_EXECUTABLE_PATH.`); process.exit(1) }
if (!existsSync('dist/index.html')) { console.error('No dist/: run `npm run build` first.'); process.exit(1) }

const PROFILE = {
  'no-gpu': { viewport: { width: 1440, height: 900, deviceScaleFactor: 2 }, cpu: 4, soft: true, touch: false },
  phone: { viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, cpu: 4, soft: true, touch: true },
  fast: { viewport: { width: 1440, height: 900, deviceScaleFactor: 2 }, cpu: 1, soft: false, touch: false },
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })
const stop = () => { try { server.kill() } catch { /* already gone */ } }
process.on('exit', stop)
for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE)).ok) break } catch { /* not up yet */ } await sleep(500) }

async function open(edition, p) {
  const browser = await puppeteer.launch({
    executablePath: chrome, headless: 'new',
    args: ['--hide-scrollbars', ...(p.soft ? ['--disable-gpu', '--disable-gpu-compositing'] : [])],
  })
  const page = await browser.newPage()
  await page.setViewport(p.viewport)
  await page.goto(`${BASE}/#/${edition}`, { waitUntil: 'load' })
  await page.waitForFunction(() => !document.getElementById('loader'), { timeout: 30000 }).catch(() => {})
  return { browser, page }
}

async function scrollRun(edition, name) {
  const p = PROFILE[name]
  const { browser, page } = await open(edition, p)
  await sleep(4000) // intro and fonts settle first
  const cdp = await page.createCDPSession()
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: p.cpu })
  const limit = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
  const target = Math.min(DISTANCE, limit)
  await page.tracing.start({ categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame', 'benchmark', 'viz'] })
  const t0 = Date.now()
  const x = Math.round(p.viewport.width / 2), y = Math.round(p.viewport.height * (p.touch ? 0.75 : 0.5))
  while ((await page.evaluate(() => scrollY)) < target - 10 && Date.now() - t0 < 45000) {
    await cdp.send('Input.synthesizeScrollGesture', { x, y, yDistance: -1400, speed: 2400, gestureSourceType: p.touch ? 'touch' : 'mouse' })
  }
  await sleep(1000)
  const events = JSON.parse(new TextDecoder().decode(await page.tracing.stop())).traceEvents
  await browser.close()

  const reports = events.filter(e => e.name === 'PipelineReporter' && e.ph === 'b' && e.args?.frame_reporter)
  const secs = reports.length > 1 ? (reports.at(-1).ts - reports[0].ts) / 1e6 : 1
  const count = (state) => reports.filter(e => e.args.frame_reporter.state === state).length
  const main = events.find(e => e.name === 'thread_name' && e.args?.name === 'CrRendererMain' && events.some(x => x.pid === e.pid && x.name === 'Paint'))
  const onMain = events.filter(e => main && e.pid === main.pid && e.tid === main.tid && e.ph === 'X' && e.dur != null)
  const total = (list) => list.reduce((s, e) => s + e.dur, 0) / 1000
  const draws = events.filter(e => e.name === 'DirectRenderer::DrawFrame').length
  return {
    dropped: count('STATE_DROPPED') / secs,
    late: count('STATE_PRESENTED_PARTIAL') / secs,
    busy: (100 * total(onMain.filter(e => e.name === 'RunTask'))) / (secs * 1000),
    style: total(onMain.filter(e => e.name === 'UpdateLayoutTree')) / secs,
    raster: total(events.filter(e => e.name === 'RasterTask' && e.ph === 'X')) / secs,
    passes: events.filter(e => e.name === 'DirectRenderer::DrawRenderPass').length / Math.max(1, draws),
  }
}

async function idleRun(edition, name) {
  const { browser, page } = await open(edition, PROFILE[name])
  await sleep(40000) // past every intro animation
  await page.tracing.start({ categories: ['viz'] })
  await sleep(5000)
  const events = JSON.parse(new TextDecoder().decode(await page.tracing.stop())).traceEvents
  await browser.close()
  return events.filter(e => e.name === 'DirectRenderer::DrawFrame').length / 5
}

const pad = (v, n, d = 1) => (typeof v === 'number' ? v.toFixed(d) : String(v)).padStart(n)
console.log(`${'page'.padEnd(8)}${'profile'.padEnd(8)}${pad('dropped', 9)}${pad('late', 7)}${pad('busy%', 7)}${pad('style', 8)}${pad('raster', 9)}${pad('passes', 8)}${IDLE ? pad('idle', 7) : ''}`)
for (const edition of EDITIONS) {
  for (const name of PROFILES) {
    if (!PROFILE[name]) { console.error(`unknown profile ${name}`); continue }
    const r = await scrollRun(edition, name)
    const idle = IDLE ? await idleRun(edition, name) : null
    console.log(`${edition.padEnd(8)}${name.padEnd(8)}${pad(r.dropped, 9)}${pad(r.late, 7)}${pad(r.busy, 7, 0)}${pad(r.style, 8, 0)}${pad(r.raster, 9, 0)}${pad(r.passes, 8)}${IDLE ? pad(idle, 7) : ''}`)
  }
}
stop()
process.exit(0)

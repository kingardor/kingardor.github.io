// VERSUS: game-flavoured views over src/content/index.js. Every number and
// claim shown below is lifted from the content module; only the labels
// (round words, move names, tiers) are ours.
import {
  CAREER, BLUE_STACK, PROJECTS, HONOURS, TALKS, WRITING, SKILLS, STATS,
} from '../../content/index.js'

// Player 1's record, straight from STATS.
const STAT_LABEL = {
  'Years shipping vision AI': 'YEARS', 'Models shipped': 'MODELS SHIPPED', 'Video AI platforms': 'PLATFORMS',
  Acquisition: 'ACQUISITION', 'Students coached': 'STUDENTS COACHED', 'NASA Space Apps': 'NASA WINS',
}
export const P1_RECORD = STATS.map(s => ({ num: s.num, label: STAT_LABEL[s.label] ?? s.label.toUpperCase(), sub: s.sub }))

export { ACTS } from './acts.js'

export const SUPERS = [
  'KEY LIGHT', 'EMBER RUSH', 'LENS LOCK', 'COLD SNAP',
  'REC MODE', 'AFTERGLOW', 'REFLECTION', 'CLOSE-UP',
]

/**
 * Chapter colours: the page is black, white and ONE spot colour, and the spot
 * changes with the act, like the spot ink on each chapter of a manga volume.
 * One per act, named after its super (data.js SUPERS); the title and the
 * last act print in the house red. ChapterInk.jsx applies them: each section
 * wears its act's ink, the fixed layers follow the act on screen.
 */
export const CHAPTER_INKS = [
  '#FF2A2A', // KEY LIGHT   · title
  '#FF6B1A', // EMBER RUSH  · story mode, final round
  '#22D3EE', // LENS LOCK   · move list
  '#4D8BFF', // COLD SNAP   · character select, training
  '#FF2A2A', // REC MODE    · replays
  '#B06CFF', // AFTERGLOW   · lore
  '#FFAE1F', // REFLECTION  · trophies (amber: pure gold goes olive on the dark wall)
  '#FF2A2A', // CLOSE-UP    · continue
]

export const MODES = [
  'TITLE', 'ARCADE LADDER', 'MOVE LIST', 'CHARACTER SELECT',
  'REPLAY THEATRE', 'LORE CODEX', 'TROPHY ROOM', 'CONTINUE?',
]

// ── Arcade ladder (the career, newest at the top, like a resume) ────────
// The boss stage is the current job (FINAL). Below it, the stages he cleared,
// newest first, with the assists slotted in by start date. The oldest roles
// share one stage, THE ORIGIN. Stages are numbered from the bottom, so reading
// down the page counts down the ladder he climbed.
const find = (org, role) => CAREER.find(c => c.org === org && (!role || c.role === role))

export const LADDER = [
  { c: find('Sentics'), word: 'FUSE EVERYTHING', org: 'SENTICS' },
  { assist: find('HP'), label: 'ASSIST', org: 'Z BY HP' },
  { c: find('UC Berkeley'), word: 'FIRE WATCH', org: 'UC BERKELEY' },
  { c: find('Avathon (formerly SparkCognition)'), word: 'CROSS-COMPILE', org: 'AVATHON' },
  { assist: find('NVIDIA'), label: 'ASSIST', org: 'NVIDIA' },
  {
    origin: [
      { c: find('Integration Wizards Solutions', 'AI Architect'), org: 'INTEGRATION WIZARDS' },
      { c: find('Integration Wizards Solutions', 'IoT & ML Engineer'), org: 'INTEGRATION WIZARDS' },
      { c: find('iB Hubs'), org: 'iB HUBS' },
    ],
    word: 'THE ORIGIN',
    finisher: { big: 'ACQUIRED!', small: 'Integration Wizards → SparkCognition · Mar 2022' },
  },
]

export const FINAL = find('BLUE')
export const BONUS = find('CopCars.in')
export { BLUE_STACK }

// ── Move list ───────────────────────────────────────────────────────────
// Inputs are numpad notation (6 = forward, 2 = down, 3 = down-forward …).
// Buttons: V vision · A agents · E edge · S systems (the four skill groups).
export const BUTTONS = [
  { k: 'V', name: 'Vision', group: 'Vision & video' },
  { k: 'A', name: 'Agents', group: 'VLMs & agents' },
  { k: 'E', name: 'Edge', group: 'Edge & robots' },
  { k: 'S', name: 'Systems', group: 'Systems' },
]

const blue = (n) => BLUE_STACK.find(b => b.name === n)

export const SUPER_ARTS = [
  {
    name: 'HYPER MEMORY', input: [2, 3, 6, 2, 3, 6, 'V'], from: 'BLUE · ' + blue('Hyper Memory').kind,
    startup: 'reads once', hit: '73% fewer calls',
    notes: '55% fewer tokens than JSON. Every fact points to the exact clip and second it came from.',
  },
  {
    name: 'DEEP SCAN', input: [6, 2, 3, 'A'], from: 'BLUE Agent',
    startup: '—', hit: 'never guesses',
    notes: 'Every number verified against source data.',
  },
  {
    name: 'MENDEL-JAMES', input: ['[4]', 6, 'A'], from: 'Helyx · ' + blue('Helyx').kind,
    startup: '—', hit: 'gene-based',
    notes: 'Detection prompts that evolve themselves from a task description and labelled footage.',
  },
  {
    name: 'YOUR QUESTIONS DID', input: [6, 3, 2, 1, 4, 'A', 'S'], from: 'BLUE Agent · generative UI',
    startup: '—', hit: 'one chat box',
    notes: 'Generative dashboards: nobody built that dashboard, your questions did.',
  },
]

export const SPECIALS = [
  { name: 'SENSOR FUSION', input: [2, 3, 6, 'S'], from: 'Sentics · C++ / CUDA', startup: 'real time', hit: '30,000+/s', notes: 'Multi-camera localisation and UWB merged into one live facility map.' },
  { name: 'WILDFIRE WATCH', input: [4, 1, 2, 3, 6, 'V'], from: 'UC Berkeley', startup: '—', hit: '~1,000 cameras', notes: 'Caltrans CCTV, a fire and smoke detector, an Apache Beam pipeline over every stream.' },
  { name: 'IRIS DEPLOY', input: [6, 6, 'V', 'S'], from: 'Integration Wizards', startup: '−75% to deploy', hit: '25+ customers', notes: 'DeepStream-native, custom TensorRT kernels, thousands of sites. Then an acquisition.' },
  { name: 'THOUSAND FPS', input: [2, 2, 'V'], from: 'YOLOv4 · DeepStream', startup: '—', hit: '1,500 FPS', notes: 'Multi-stream DeepStream on RTX. The video says so.' },
  { name: 'POCKET VISION', input: [2, 3, 6, 'E'], from: 'Q-Pocket-AI · Cortex-A53', startup: '~180 ms', hit: '0 cloud bytes', notes: 'Open-world detection and a VLM on a board with no NPU.' },
  { name: 'ROAST MODE', input: [4, 6, 'A', 'E'], from: 'Vector Desk AI', startup: '0.67 s', hit: '98.0%', notes: 'Behaviour score over 118 scenarios × 3 trials. Attitude not included in the score.' },
  { name: 'CASEBOOK', input: [6, 2, 3, 'E'], from: 'Noir Rover', startup: '4.15 s', hit: '883 tests', notes: '“What do you see?” “A mug is in front of me.” With citations.' },
  { name: 'JETSON DOJO', input: [8, 2, 'E', 'S'], from: 'NVIDIA Jetson AI Ambassador', startup: '—', hit: '100+ students', notes: 'Hands-on workshops on building and deploying AI on Jetson.' },
]

export const NORMALS = SKILLS.groups.map((g, i) => ({ ...g, button: BUTTONS[i].k }))
export const TRAINING = SKILLS.techBars

// ── Character select ────────────────────────────────────────────────────
// Portrait crops and four honest stats per fighter (values verbatim from facts).
const PORTRAIT = {
  noir: { img: 0, pos: '50% 46%', zoom: 1.15 },
  vector: { img: 0, pos: '46% 36%', zoom: 1.2 },
  veronica: { img: 0, pos: '50% 32%', zoom: 2.4 },
  hermes: { img: 2, pos: '30% 50%', zoom: 1.35 },
  'q-pocket': { img: 0, pos: '66% 42%', zoom: 1.25 },
  copcars: { img: 0, pos: '72% 62%', zoom: 1.2 },
  zassistant: { img: 0, pos: '32% 22%', zoom: 1.7 },
  shred: { img: 0, pos: '74% 32%', zoom: 1.9 },
}

const FIGHTER_STATS = {
  noir: [['TESTS', '883'], ['TRIALS', '486/555'], ['REPLY', '4.15 s'], ['MODELS', '1']],
  vector: [['BEHAVIOUR', '98.0%'], ['LATENCY', '0.67 s'], ['WAKE', '48/48'], ['WORD ERR', '24%→3%']],
  veronica: [['AGENTS', '7'], ['CLOUD CALLS', '0'], ['SINCE', '2021'], ['AOTM', 'NOV 2024']],
  hermes: [['STARS', '67'], ['FORKS', '27'], ['LATENCY', '< 1 s'], ['AUTO-LAND', '10 s']],
  'q-pocket': [['DETECT', '~180 ms'], ['VLM', '0.8B'], ['LEDS', '8 × 13'], ['CLOUD', '0 B']],
  copcars: [['STATUS', 'LIVE'], ['CREW', '1'], ['EDGE', 'WORKERS'], ['PAY', 'RAZORPAY']],
  zassistant: [['MODEL', '8B LOCAL'], ['CITES', 'DOC + PAGE'], ['GPU', 'BORROWED'], ['STAGE', 'GTC 2024']],
  shred: [['HOOKS', '0'], ['INPUT', '416²'], ['YEAR', '2019'], ['FEATURE', 'AUG 2019']],
}

// Each fighter wears its own ink in character select (tile tint, preview, VS
// screen, stage), an exception to one spot colour per chapter. None of them
// is blue: blue belongs to the boss (BLUE_INK).
const FIGHTER_INKS = {
  noir: '#FFAE1F', vector: '#FF4FA3', veronica: '#B06CFF', hermes: '#FF2A2A',
  'q-pocket': '#A3E635', copcars: '#2EE59D', zassistant: '#22D3EE', shred: '#FF6B1A',
}
export const BLUE_INK = '#2F6BFF'

const SHORT = { vector: 'VECTOR', 'q-pocket': 'Q-POCKET', shred: 'SHRED FPS', zassistant: 'Z ASSISTANT' }

const ALIAS = {
  noir: 'THE DETECTIVE', vector: 'THE ROASTER', veronica: 'THE QUEEN', hermes: 'THE FIREFINDER',
  'q-pocket': 'THE POCKET', copcars: 'THE DEALER', zassistant: 'THE ADVISOR', shred: 'THE SPOTTER',
}

export const ROSTER = PROJECTS.map((p, i) => ({
  ...p,
  n: i + 1,
  alias: ALIAS[p.slug],
  short: SHORT[p.slug] ?? p.name,
  portrait: { ...PORTRAIT[p.slug], src: p.images[PORTRAIT[p.slug].img].src, w: p.images[PORTRAIT[p.slug].img].w, h: p.images[PORTRAIT[p.slug].img].h },
  stats: FIGHTER_STATS[p.slug],
  taunt: p.quote?.line ?? p.pitch,
  tauntBy: p.quote ? p.quote.by : null,
  ink: 'spot',
  color: FIGHTER_INKS[p.slug],
  link: p.private
    ? (p.slug === 'veronica' ? { href: '#/chat', label: 'TALK TO HER WEB TWIN' } : { href: p.href, label: 'VISIT COPCARS.IN' })
    : { href: p.repo, label: 'SOURCE ON GITHUB' },
}))

export const BOSS = {
  slug: 'blue', name: 'BLUE', alias: 'THE FINAL BOSS', kicker: FINAL.role,
  pitch: 'Cameras record everything and remember nothing. I’m fixing that.',
  link: { href: FINAL.orgUrl, label: 'MYBLUE.AI' },
  color: BLUE_INK,
}

// ── Replays, lore, trophies ─────────────────────────────────────────────
const ytId = (u) => (u ? new URL(u).searchParams.get('v') : null)
const BEST = new Set([
  'Supercharge Gen AI Development with Z by HP GenAI Lab and AI Studio',
  'Two live demos: Z Agent, and an LLM driving NanoOWL',
  'BLUE: a semantic video data lake for the real world',
])
export const REPLAYS = TALKS.map((t, i) => ({ ...t, n: i + 1, yt: ytId(t.video), best: BEST.has(t.title) }))

export const LORE = WRITING.map((w, i) => ({ ...w, n: WRITING.length - i }))

const TIER = { GTC: 'platinum', NASA: 'gold', 'Z BY HP': 'silver', NVIDIA: 'silver', EOY: 'silver', SIH: 'bronze', PAPER: 'bronze' }
const TROPHY_NAME = {
  GTC: 'GTC SPEAKER', 'Z BY HP': 'AMBASSADOR OF THE MONTH', NASA: 'SPACE APPS',
  NVIDIA: 'JETSON SPECIALIST', EOY: 'EMPLOYEE OF THE YEAR', SIH: 'TOP TEN', PAPER: 'BEST PAPER',
}
export const TROPHIES = HONOURS.map((h, i) => ({
  ...h, id: i, tier: TIER[h.key] ?? 'bronze', name: TROPHY_NAME[h.key] ?? h.key,
  sub: `${h.issuer} · ${h.year}`,
}))
export const TIER_ORDER = ['platinum', 'gold', 'silver', 'bronze']

// Screen-reader words for input notation.
const DIR_WORD = { 6: 'forward', 3: 'down-forward', 2: 'down', 1: 'down-back', 4: 'back', 7: 'up-back', 8: 'up', 9: 'up-forward' }
export function describeInput(input) {
  return input.map(t => (typeof t === 'number' ? DIR_WORD[t] : t.startsWith('[') ? `hold ${DIR_WORD[t.slice(1, -1)]}` : `${t} button`)).join(', ')
}

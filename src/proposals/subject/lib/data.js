// Everything SUBJECT 001 derives from the content module. Facts come from
// src/content/index.js; only the labels, jokes and coordinates live here.
import {
  CAREER, BLUE_STACK, EDUCATION, PROJECTS, ARCHIVE, SKILLS, WRITING, TALKS,
  HONOURS, OFF_DUTY,
} from '../../../content/index.js'
import SEQ from '../../../components/story/sequences.generated.json'

// ── Class palette ────────────────────────────────────────────────────────
export const CLS = {
  person: '#FF3D00',
  robot: '#B6FF3B',
  hardware: '#FFC21A',
  screen: '#FF4FD8',
  text: '#9D8CFF',
  fire: '#FF8A00',
  unknown: '#ECE9E2',
}

export const INFERNO = ['#000004', '#420A68', '#932667', '#DD513A', '#FCA50A', '#FCFFA4']
export function inferno(t) {
  const x = Math.max(0, Math.min(1, t)) * (INFERNO.length - 1)
  const i = Math.min(INFERNO.length - 2, Math.floor(x))
  const f = x - i
  const a = hex(INFERNO[i]), b = hex(INFERNO[i + 1])
  return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(',')})`
}
function hex(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)) }

// ── Sections, in scroll order ────────────────────────────────────────────
// Eight of them own a film act; sj-memory rides on act 1.
export const SECTIONS = [
  { id: 'sj-acquire', name: 'Acquire', act: 1, where: 'GOLDEN GATE', cite: 'his face' },
  { id: 'sj-memory', name: 'Hyper Memory', act: 1, where: 'GOLDEN GATE', cite: 'Hyper Memory' },
  { id: 'sj-identity', name: 'Identity graph', act: 2, where: 'DUSK · ARMOURY', cite: 'the identity graph' },
  { id: 'sj-classes', name: 'Class list', act: 3, where: 'VOID · BENCH', cite: 'the class list' },
  { id: 'sj-sightings', name: 'Sightings', act: 4, where: 'SCHEMATICS', cite: 'the sightings' },
  { id: 'sj-signals', name: 'Signals', act: 5, where: 'REC', cite: 'the signal log' },
  { id: 'sj-moments', name: 'Moments', act: 6, where: 'GLYPH RAIN', cite: 'Moments' },
  { id: 'sj-verified', name: 'Verified', act: 7, where: 'GOLDEN HOUR', cite: 'the honours' },
  { id: 'sj-deepscan', name: 'Deep Scan', act: 8, where: 'FINAL FORM', cite: 'this report' },
]
export const ACTS = SECTIONS.filter((s, i) => i !== 1).map((s, i) => ({ id: s.id, seq: `story-${i + 1}` }))
export const FPS = SEQ.fps || 15
export const FRAMES_PER_ACT = SEQ.sequences['story-1']?.count || 90
export const TOTAL_FRAMES = Object.values(SEQ.sequences).reduce((n, s) => n + (s.count || 0), 0)
export function frameSrc(act, frame, variant = 'd') {
  const s = SEQ.sequences[`story-${act}`]
  if (!s) return '/hero.webp'
  return `/seq/${s.dir}/${variant}/${String(frame).padStart(4, '0')}.avif`
}
export function tc(seconds, frames = null) {
  const s = Math.max(0, Math.floor(seconds))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return frames == null ? `${mm}:${ss}` : `${mm}:${ss}:${String(frames).padStart(2, '0')}`
}

// ── Film overlays: footage-space boxes per act ───────────────────────────
// k: keyframes [t, u, v, w, h] in 0..1 footage space; on: visible t-window.
const FACE_END_1 = [0.38, 0.10, 0.25, 0.48]
export const FILM_BOXES = {
  'sj-acquire': [
    { key: 'face', cls: 'person', label: 'person 0.99 · id 001', primary: true,
      k: [[0, 0.31, 0.02, 0.32, 0.58], [0.33, 0.34, 0.03, 0.29, 0.58], [0.66, ...FACE_END_1], [1, ...FACE_END_1]] },
    { key: 'bridge', cls: 'unknown', label: 'bridge 0.98 · golden gate · famous', on: [0, 0.42],
      k: [[0, 0.085, 0.25, 0.06, 0.16], [0.33, 0.12, 0.02, 0.13, 0.48], [0.45, 0.14, 0.12, 0.1, 0.4]] },
    { key: 'circuit', cls: 'hardware', label: 'circuit 0.71 · waking up', on: [0.46, 1],
      k: [[0.46, 0.40, 0.22, 0.2, 0.2], [1, 0.41, 0.22, 0.19, 0.19]] },
  ],
  'sj-identity': [
    { key: 'face', cls: 'person', label: 'person 0.99 · id 001 · turning',
      k: [[0, ...FACE_END_1], [0.33, 0.30, 0.08, 0.28, 0.47], [0.66, 0.29, 0.02, 0.33, 0.55], [1, 0.30, 0.05, 0.30, 0.55]] },
    { key: 'armour', cls: 'hardware', label: 'armour 0.93 · assembling', on: [0.22, 1],
      k: [[0.22, 0.2, 0.55, 0.12, 0.2], [0.33, 0.18, 0.53, 0.16, 0.25], [0.66, 0.09, 0.55, 0.25, 0.35], [1, 0.1, 0.55, 0.25, 0.34]] },
    { key: 'ghost', cls: 'unknown', label: 'bridge 0.41 · hallucination', on: [0.55, 1],
      k: [[0.55, 0.64, 0.14, 0.17, 0.36], [1, 0.64, 0.14, 0.17, 0.36]] },
  ],
  'sj-classes': [
    { key: 'face', cls: 'person', label: 'person 0.98 · id 001 · lights off',
      k: [[0, 0.30, 0.05, 0.30, 0.55], [0.33, 0.33, 0.0, 0.30, 0.6], [0.66, 0.31, 0.01, 0.31, 0.57], [1, 0.33, 0.03, 0.31, 0.55]] },
    { key: 'armour', cls: 'hardware', label: 'armour 0.97 · assembled', on: [0, 0.5],
      k: [[0, 0.08, 0.54, 0.25, 0.35], [1, 0.08, 0.54, 0.25, 0.35]] },
    { key: 'pcb', cls: 'hardware', label: 'pcb 0.97 · exposed', on: [0.45, 1],
      k: [[0.45, 0.32, 0.19, 0.08, 0.12], [1, 0.33, 0.18, 0.09, 0.13]] },
  ],
  'sj-sightings': [
    { key: 'face', cls: 'person', label: 'person 0.96 · id 001 · chrome pending',
      k: [[0, 0.33, 0.03, 0.31, 0.55], [0.33, 0.27, 0.08, 0.35, 0.55], [0.66, 0.30, 0.12, 0.33, 0.5], [1, 0.32, 0.12, 0.32, 0.5]] },
    { key: 'drone', cls: 'robot', label: 'drone 0.94 · schematic only', on: [0.55, 1],
      k: [[0.55, 0.04, 0.22, 0.21, 0.30], [1, 0.04, 0.22, 0.21, 0.30]] },
    { key: 'lens', cls: 'hardware', label: 'lens 0.92 · watching back', on: [0.55, 1],
      k: [[0.55, 0.69, 0.24, 0.26, 0.26], [1, 0.69, 0.22, 0.26, 0.28]] },
  ],
  'sj-signals': [
    { key: 'eye', cls: 'person', label: 'eye 1.00 · recording', on: [0.18, 1],
      k: [[0.18, 0.40, 0.27, 0.12, 0.12], [0.66, 0.36, 0.28, 0.14, 0.14], [1, 0.38, 0.29, 0.13, 0.13]] },
    { key: 'rec', cls: 'screen', label: 'rec 0.99 · it was always on', on: [0.3, 1],
      k: [[0.3, 0.85, 0.03, 0.12, 0.08], [1, 0.84, 0.04, 0.13, 0.08]] },
    { key: 'wave', cls: 'screen', label: 'audio 0.91 · he won’t stop talking', on: [0.45, 1],
      k: [[0.45, 0.03, 0.28, 0.28, 0.22], [1, 0.03, 0.28, 0.28, 0.22]] },
    { key: 'drone', cls: 'robot', label: 'drone 0.94 · leaving', on: [0, 0.16],
      k: [[0, 0.04, 0.22, 0.21, 0.30], [1, 0.04, 0.22, 0.21, 0.30]] },
  ],
  'sj-moments': [
    { key: 'eye', cls: 'person', label: 'eye 0.97 · reading you',
      k: [[0, 0.38, 0.29, 0.13, 0.13], [0.33, 0.38, 0.29, 0.12, 0.12], [0.66, 0.29, 0.29, 0.12, 0.12], [1, 0.38, 0.29, 0.12, 0.12]] },
    { key: 'glyphs', cls: 'text', label: 'text ×412 · unreadable · probably a manifesto', on: [0.42, 1],
      k: [[0.42, 0.68, 0.0, 0.31, 0.76], [1, 0.68, 0.0, 0.31, 0.76]] },
    { key: 'wave', cls: 'screen', label: 'audio 0.88 · fading', on: [0, 0.22],
      k: [[0, 0.03, 0.28, 0.28, 0.22], [1, 0.03, 0.28, 0.28, 0.22]] },
  ],
  'sj-verified': [
    { key: 'face', cls: 'person', label: 'person 0.88 · id 001 · bowing',
      k: [[0, 0.33, 0.0, 0.30, 0.6], [0.33, 0.33, 0.05, 0.42, 0.6], [0.66, 0.33, 0.02, 0.33, 0.58], [1, 0.33, 0.03, 0.33, 0.58]] },
    { key: 'light', cls: 'unknown', label: 'light 0.99 · golden hour · fake', on: [0.12, 0.55],
      k: [[0.12, 0.38, 0.0, 0.26, 0.07], [0.55, 0.38, 0.0, 0.26, 0.07]] },
    { key: 'chrome', cls: 'hardware', label: 'chrome 0.99 · mirror finish', on: [0.5, 1],
      k: [[0.5, 0.35, 0.23, 0.14, 0.25], [1, 0.35, 0.22, 0.14, 0.26]] },
  ],
  'sj-deepscan': [
    { key: 'face', cls: 'person', label: 'subject 001 · final form · 1.00',
      k: [[0, 0.33, 0.03, 0.33, 0.58], [1, 0.32, 0.02, 0.35, 0.6]] },
    { key: 'eye', cls: 'person', label: 'eye 1.00 · still recording you', on: [0.1, 1],
      k: [[0.1, 0.38, 0.29, 0.12, 0.12], [1, 0.38, 0.29, 0.12, 0.12]] },
    { key: 'cheek', cls: 'hardware', label: 'circuit 0.90 · right side, at last', on: [0.3, 1],
      k: [[0.3, 0.55, 0.33, 0.09, 0.15], [1, 0.55, 0.33, 0.09, 0.15]] },
  ],
}

// ── Hyper Memory: what the model writes down about the film ─────────────
// One row per act, at the act's real timecode in the footage.
export const FILM_MEMORY = [
  { act: 1, row: 'person#001 wears shades @golden_gate ; bridge#1 behind' },
  { act: 2, row: 'armour#1 assembles @shoulder.l ; light→dusk' },
  { act: 3, row: 'pcb#1 exposed @head.l ; bg→void ; harness routes' },
  { act: 4, row: 'plate#1 covers face.l ; drone#1 lens#1 appear' },
  { act: 5, row: 'eye.l →red ; rec#1 on ; audio#1 peaks' },
  { act: 6, row: 'text×412 falls ; legibility 0 ; eye dims' },
  { act: 7, row: 'person#001 bows ; chrome polished ; light→gold' },
  { act: 8, row: 'person#001 final_form ; cam pushes in' },
].map(r => ({ ...r, t: tc((r.act - 1) * (FRAMES_PER_ACT / FPS) + 2) }))

export const AGENT_MODES = [
  { key: 'signals', name: 'Signals', target: 'sj-signals',
    here: 'Every stage, booth and webinar he has been let loose on, as a timestamped log. Some of it plays inline.' },
  { key: 'memories', name: 'Memories', target: 'sj-identity',
    here: 'Nine years of roles, companies and products, read once into a graph that builds itself as you scroll.' },
  { key: 'moments', name: 'Moments', target: 'sj-moments',
    here: 'Type a word, get the moment. Projects, products, talks, writing, career and honours, one box.' },
  { key: 'deepscan', name: 'Deep Scan', target: 'sj-deepscan',
    here: 'The full write-up. Of you. Every sentence cites the part of the page it came from.' },
]

// ── Identity graph ───────────────────────────────────────────────────────
const career = (role, org) => CAREER.find(c => c.role === role && (!org || c.org.startsWith(org)))
const blue = name => BLUE_STACK.find(b => b.name === name)

// x/y are 0..1 in the stage band. Lanes: 0.06 orgs, 0.25 side roles + stages, 0.45 the day-job spine,
// 0.68 meanwhile, 0.9 things built. `l` puts the label left of the point.
export const GRAPH_NODES = [
  { id: 'subj', kind: 'person', label: 'AKASH JAMES · 001', year: 2014.0, x: 0.0, y: 0.45 },
  { id: 'reva', kind: 'edu', label: 'REVA University', year: 2014.2, x: 0.06, y: 0.06, ref: { edu: EDUCATION[1] } },
  { id: 'ibhubs', kind: 'role', label: 'Intern · iB Hubs', year: 2017.4, x: 0.135, y: 0.45, ref: { career: career('Product Developer (intern)') } },
  { id: 'iw', kind: 'org', label: 'Integration Wizards', year: 2018.7, x: 0.24, y: 0.06 },
  { id: 'iot', kind: 'role', label: 'IoT & ML Engineer', year: 2018.8, x: 0.245, y: 0.45, ref: { career: career('IoT & ML Engineer') } },
  { id: 'aiarch', kind: 'role', label: 'AI Architect', year: 2020.5, x: 0.365, y: 0.45, ref: { career: career('AI Architect', 'Integration') } },
  { id: 'iris', kind: 'product', label: 'IRIS', year: 2020.7, x: 0.37, y: 0.9, ref: { product: 'IRIS' } },
  { id: 'nvamb', kind: 'role', label: 'Jetson AI Ambassador', year: 2021.3, x: 0.4, y: 0.68, ref: { career: career('NVIDIA Jetson AI Ambassador') } },
  { id: 'nvidia', kind: 'org', label: 'NVIDIA', year: 2021.35, x: 0.44, y: 0.25 },
  { id: 'spark', kind: 'org', label: 'SparkCognition', year: 2022.2, x: 0.4, y: 0.06 },
  { id: 'avathon', kind: 'org', label: 'Avathon', year: 2022.3, x: 0.535, y: 0.06 },
  { id: 'lead', kind: 'role', label: 'Lead AI Architect', year: 2022.4, x: 0.5, y: 0.45, ref: { career: career('Lead AI Architect') } },
  { id: 'vaia', kind: 'product', label: 'VAIA', year: 2022.6, x: 0.49, y: 0.9, ref: { product: 'VAIA' } },
  { id: 'berkeley', kind: 'role', label: 'Research Scholar · UC Berkeley', year: 2023.2, x: 0.53, y: 0.68, ref: { career: career('Research Scholar') } },
  { id: 'wildfire', kind: 'product', label: 'Wildfire · ~1,000 cams', year: 2023.3, x: 0.565, y: 0.9, ref: { product: 'wildfire' } },
  { id: 'hp', kind: 'role', label: 'Z by HP Ambassador', year: 2023.8, x: 0.6, y: 0.25, ref: { career: career('Z by HP Global Data Science Ambassador') } },
  { id: 'sentics', kind: 'role', label: 'Sr Developer · Sentics', year: 2024.85, x: 0.645, y: 0.45, ref: { career: career('Senior Software Developer (freelance)') } },
  { id: 'gtc', kind: 'event', label: 'NVIDIA GTC 2025 stage', year: 2025.15, x: 0.735, y: 0.25, ref: { product: 'gtc' } },
  { id: 'blue', kind: 'role', label: 'Founding Director of AI', year: 2025.2, x: 0.79, y: 0.45, ref: { career: career('Founding Director of AI') } },
  { id: 'blueorg', kind: 'org', label: 'BLUE', year: 2025.25, x: 0.875, y: 0.06 },
  { id: 'hm', kind: 'product', label: 'Hyper Memory', year: 2025.4, x: 0.77, y: 0.9, ref: { blue: blue('Hyper Memory') } },
  { id: 'agent', kind: 'product', label: 'BLUE Agent', year: 2025.5, x: 0.85, y: 0.9, ref: { blue: blue('BLUE Agent') } },
  { id: 'helyx', kind: 'product', label: 'Helyx', year: 2025.6, x: 0.835, y: 0.68, ref: { blue: blue('Helyx') } },
  { id: 'copilot', kind: 'product', label: 'BLUE Copilot', year: 2025.7, x: 0.9, y: 0.68, ref: { blue: blue('BLUE Copilot') } },
  { id: 'edge', kind: 'product', label: 'BLUE Mini Edge', year: 2025.8, x: 1.0, y: 0.9, l: true, ref: { blue: blue('BLUE Mini Edge') } },
  { id: 'infer', kind: 'product', label: 'Inference & MLOps', year: 2025.9, x: 0.72, y: 0.68, ref: { blue: blue('Inference & MLOps') } },
  { id: 'copcars', kind: 'role', label: 'Founder · CopCars.in', year: 2026.4, x: 0.985, y: 0.25, l: true, ref: { career: career('Founder', 'CopCars') } },
]

export const GRAPH_EDGES = [
  ['subj', 'reva', 'studied at'],
  ['subj', 'ibhubs', 'interned'],
  ['ibhubs', 'iot', 'then'],
  ['iot', 'iw', 'at'],
  ['iot', 'aiarch', 'promoted'],
  ['aiarch', 'iw', 'at'],
  ['aiarch', 'iris', 'built'],
  ['aiarch', 'nvamb', 'meanwhile'],
  ['nvamb', 'nvidia', 'ambassador for', 0.72],
  ['iw', 'spark', 'acquired by'],
  ['spark', 'avathon', 'became'],
  ['lead', 'avathon', 'at'],
  ['aiarch', 'lead', 'then'],
  ['iris', 'vaia', 'became'],
  ['lead', 'vaia', 'built'],
  ['lead', 'berkeley', 'meanwhile'],
  ['berkeley', 'wildfire', 'built'],
  ['lead', 'hp', 'meanwhile'],
  ['hp', 'gtc', 'spoke at'],
  ['lead', 'sentics', 'then'],
  ['sentics', 'blue', 'then'],
  ['blue', 'blueorg', 'at'],
  ['blue', 'hm', 'built'],
  ['blue', 'agent', 'built'],
  ['blue', 'helyx', 'built'],
  ['blue', 'copilot', 'built'],
  ['blue', 'edge', 'built'],
  ['blue', 'infer', 'built'],
  ['blue', 'copcars', 'meanwhile'],
]

const iwAI = career('AI Architect', 'Integration')
const avLead = career('Lead AI Architect')
const ucb = career('Research Scholar')
const hpAmb = career('Z by HP Global Data Science Ambassador')
export const PRODUCT_RECORDS = {
  IRIS: { title: 'IRIS', sub: 'Video analytics platform · Integration Wizards', period: iwAI.period, body: iwAI.blurb, list: iwAI.wins },
  VAIA: { title: 'VAIA · Visual AI Advisor', sub: 'Video AI platform · Avathon', period: avLead.period, body: avLead.blurb, list: avLead.wins },
  wildfire: { title: 'Wildfire detection', sub: 'UC Berkeley · Caltrans CCTV', period: ucb.period, body: ucb.blurb, list: [] },
  gtc: { title: 'NVIDIA GTC 2025', sub: 'HP session · on stage', period: 'Mar 2025', body: hpAmb.wins[0], list: hpAmb.wins.slice(1, 2) },
}
export const ORG_NOTES = {
  iw: 'Where IRIS was built. Bought by SparkCognition in Mar 2022; he stayed through the acquisition.',
  spark: 'Acquired Integration Wizards in Mar 2022. Now Avathon.',
  avathon: 'Formerly SparkCognition. He refined IRIS into VAIA here and turned VAIA into an SDK.',
  nvidia: 'Jetson AI Ambassador 2021–2025, Jetson AI Research Lab member, GTC speaker.',
  blueorg: 'The world’s first semantic video data lake for the CCTV cameras you already own. In stealth until Feb 2026.',
}

// ── Class list ───────────────────────────────────────────────────────────
const ALIAS = {
  'YOLO / YOLOE': ['yolo'], 'Re-ID & tracking': ['re-id', 'tracker', 'tracking'],
  'Jetson Nano → Thor': ['jetson'], 'Agent harnesses': ['harness', 'planner'],
  'Agent memory': ['memory'], 'Tool calling': ['tool'], 'Knowledge graphs': ['knowledge graph'],
  Drones: ['drone', 'tello'], 'Sensor fusion': ['sensor fusion'], 'Anki Vector': ['vector'],
  'Moorebot Scout': ['scout'], 'Arduino UNO Q': ['uno q', 'arduino'], 'Cloudflare Workers': ['workers'],
  'Apache Beam': ['beam'], VLMs: ['vlm', 'vision-language'], RAG: ['rag'], 'C++': ['c++'],
  ROS: ['ros '], OpenCV: ['opencv'], vLLM: ['vllm'], CUDA: ['cuda'],
}
const GROUP_CLS = { 'Vision & video': 'screen', 'VLMs & agents': 'text', 'Edge & robots': 'robot', Systems: 'hardware' }
const projText = p => [p.name, p.desc, p.story, p.kicker, ...(p.stack || []), ...(p.tags || [])].join(' ').toLowerCase()
const careerText = c => [c.role, c.org, c.blurb, ...(c.wins || []), ...(c.tags || [])].join(' ').toLowerCase()
const years = Object.fromEntries(SKILLS.techBars.map(t => [t.tech.toLowerCase(), t.years]))

export const SKILL_TOKENS = SKILLS.groups.flatMap(g => g.items.map(item => {
  const needles = ALIAS[item] || [item.toLowerCase()]
  const hit = txt => needles.some(n => txt.includes(n))
  const projects = PROJECTS.filter(p => hit(projText(p))).map(p => p.slug)
  const roles = CAREER.filter(c => hit(careerText(c))).length
  const evidence = projects.length + roles
  const score = Math.min(0.99, 0.62 + 0.07 * evidence)
  const yrs = years[item.toLowerCase()] || (item.startsWith('Jetson') ? years['nvidia jetson'] : null)
  return { item, group: g.name, cls: GROUP_CLS[g.name], projects, roles, evidence, score, years: yrs }
}))
export const DOMAINS = SKILLS.radar.map(r => ({ ...r, score: r.score / 100 }))

// ── Sightings: hand-placed detections on each cover ──────────────────────
export const SIGHTING_BOXES = {
  noir: [
    { cls: 'robot', label: 'robot 0.96 · noir · armed with opinions', b: [0.27, 0.31, 0.45, 0.27] },
    { cls: 'hardware', label: 'controller 0.91', b: [0.70, 0.49, 0.30, 0.2] },
    { cls: 'unknown', label: 'diecast ×2', b: [0.09, 0.52, 0.17, 0.08] },
  ],
  vector: [
    { cls: 'robot', label: 'robot 0.98 · vector · hostile', b: [0.33, 0.04, 0.39, 0.52] },
    { cls: 'person', label: 'hand 0.94 · id 001', b: [0.19, 0.42, 0.58, 0.58] },
  ],
  veronica: [
    { cls: 'screen', label: 'screen 0.97 · veronica · speaking', b: [0.36, 0.03, 0.26, 0.52] },
    { cls: 'text', label: 'agents ×7 · working', b: [0.0, 0.07, 0.24, 0.53] },
  ],
  hermes: [
    { cls: 'fire', label: 'fire 0.98', b: [0.004, 0.15, 0.366, 0.23] },
    { cls: 'fire', label: 'fire 0.96', b: [0.487, 0.585, 0.2, 0.185] },
    { cls: 'fire', label: 'fire 0.83', b: [0.598, 0.37, 0.034, 0.05] },
  ],
  'q-pocket': [
    { cls: 'hardware', label: 'board 0.94 · uno q', b: [0.21, 0.33, 0.15, 0.21] },
    { cls: 'person', label: 'person 0.99 · id 001', b: [0.44, 0.12, 0.29, 0.56] },
  ],
  copcars: [
    { cls: 'unknown', label: 'diecast 0.97', b: [0.18, 0.40, 0.27, 0.17] },
    { cls: 'unknown', label: 'diecast 0.95', b: [0.34, 0.41, 0.31, 0.25], below: true },
    { cls: 'screen', label: 'sign 0.99 · neon', b: [0.64, 0.12, 0.33, 0.25] },
  ],
  zassistant: [
    { cls: 'text', label: 'text 0.99 · headline', b: [0.19, 0.12, 0.42, 0.15] },
    { cls: 'screen', label: 'ui 0.95 · input', b: [0.17, 0.86, 0.66, 0.09] },
  ],
  shred: [
    { cls: 'unknown', label: 'enemy 0.50', b: [0.66, 0.33, 0.06, 0.1], below: true },
    { cls: 'screen', label: 'screen 0.93 · unreal tournament', b: [0.0, 0.02, 0.455, 0.56] },
  ],
}
// Board placement (desktop): column and vertical offset in vh-ish units.
export const SIGHTING_ORDER = ['noir', 'vector', 'veronica', 'hermes', 'q-pocket', 'copcars', 'zassistant', 'shred']
export const SIGHTING_LINKS = [
  { from: 'veronica', to: 'vector', label: 'descendant of', dir: 'vector ← veronica' },
  { from: 'vector', to: 'noir', label: 'descendant of', dir: 'noir ← vector' },
  { from: 'hermes', to: 'mini-edge', label: 'same eyes' },
]
export const PROJECT_BY_SLUG = Object.fromEntries(PROJECTS.map(p => [p.slug, p]))
export const PROJECT_CLS = {
  noir: 'robot', vector: 'robot', veronica: 'screen', hermes: 'fire',
  'q-pocket': 'hardware', copcars: 'unknown', zassistant: 'text', shred: 'screen',
}

// ── Signals ──────────────────────────────────────────────────────────────
export function ytId(url) { return url ? (url.match(/[?&]v=([^&]+)/) || [])[1] : null }
export function waveform(seed, n = 18) {
  let h = 2166136261
  for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) }
  return Array.from({ length: n }, (_, i) => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5
    const env = Math.sin((i / (n - 1)) * Math.PI) * 0.7 + 0.3
    return Math.max(0.12, ((h >>> 0) % 1000) / 1000 * env)
  })
}
export const KIND_CLS = { panel: 'text', workshop: 'robot', exhibit: 'screen', stage: 'person', demo: 'hardware', webinar: 'unknown', show: 'screen', talk: 'fire' }

// ── Moments: one search index over everything ────────────────────────────
export const SEARCH_INDEX = [
  ...PROJECTS.map(p => ({ type: 'project', cls: PROJECT_CLS[p.slug], label: p.name, sub: p.pitch, keywords: [p.kicker, p.desc, ...(p.stack || []), ...(p.tags || [])].join(' '), act: { kind: 'case', slug: p.slug }, meta: String(p.year) })),
  ...BLUE_STACK.map(b => ({ type: 'blue', cls: 'person', label: b.name, sub: b.line, keywords: [b.kind, ...b.facts].join(' '), act: { kind: 'scroll', id: 'sj-memory' }, meta: 'BLUE' })),
  ...TALKS.map(t => ({ type: 'talk', cls: KIND_CLS[t.kind] || 'unknown', label: t.title, sub: t.where, keywords: t.kind, act: t.video ? { kind: 'link', href: t.video } : { kind: 'scroll', id: 'sj-signals' }, meta: t.date || t.kind })),
  ...WRITING.map(w => ({ type: 'writing', cls: 'text', label: w.title, sub: w.pub, keywords: w.platform, act: w.url ? { kind: 'link', href: w.url } : { kind: 'none' }, meta: w.date.slice(0, 4) })),
  ...CAREER.map(c => ({ type: 'career', cls: 'unknown', label: `${c.role} · ${c.org}`, sub: c.period, keywords: [c.blurb, ...(c.tags || []), ...(c.wins || [])].join(' '), act: { kind: 'scroll', id: 'sj-identity' }, meta: String(c.startYear) })),
  ...HONOURS.map(h => ({ type: 'honour', cls: 'hardware', label: h.title, sub: h.issuer, keywords: h.key, act: h.url ? { kind: 'link', href: h.url } : { kind: 'scroll', id: 'sj-verified' }, meta: String(h.year) })),
  ...OFF_DUTY.map(o => ({ type: 'offduty', cls: 'unknown', label: o, sub: 'off duty · the human bits', keywords: 'hobby human', act: { kind: 'none' }, meta: 'off' })),
  ...ARCHIVE.map(a => ({ type: 'archive', cls: 'unknown', label: a.name, sub: a.desc, keywords: '', act: a.repo ? { kind: 'link', href: a.repo } : { kind: 'scroll', id: 'sj-sightings' }, meta: String(a.year) })),
]

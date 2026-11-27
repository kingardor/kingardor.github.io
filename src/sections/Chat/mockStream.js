/**
 * Dev-only stand-in for streamChat (`#/chat?mock=1` on the Vite dev server):
 * replays a realistic turn (thinking → tool call → block → streamed answer)
 * with the same event shapes the Worker sends, so skins can be designed and
 * screenshotted in every state without spending OpenRouter tokens.
 *   ?mock=1          normal pace     ?mock=slow   10× slower (freeze a state)
 *   ask "error"      ends in an error event
 */
import { CAREER, PROJECTS, ARCHIVE, SKILLS, WRITING, HONOURS, EDUCATION, TALKS } from '../../content/index.js'

const careerTimeline = () => ({
  career: CAREER.map(c => ({
    company: c.org, role: c.role, period: c.period, start_year: c.startYear,
    end_year: c.endYear ?? new Date().getUTCFullYear(), blurb: c.blurb, wins: c.wins, tags: c.tags,
  })),
})
const projectList = () => ({
  projects: PROJECTS.map(p => ({
    name: p.name, url: p.repo || p.href || '', desc: p.desc, pitch: p.pitch, status: p.status,
    facts: (p.facts || []).map(f => `${f.k}: ${f.v}`), source_private: !!p.private, tags: p.tags,
  })),
  older_work: ARCHIVE.map(a => ({ name: a.name, year: a.year, stars: a.stars, url: a.repo, desc: a.desc })),
})
const videos = () => ({
  items: TALKS.filter(t => t.video).slice(0, 6).map((t, i) => {
    const id = (t.video.match(/[?&]v=([\w-]{11})/) || t.video.match(/youtu\.be\/([\w-]{11})/) || [])[1] || `mock${i}`
    return { id, title: t.title, url: t.video, thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, publishedAt: new Date(Date.now() - (i + 1) * 9e8).toISOString() }
  }),
})
const RESULTS = {
  get_projects: projectList,
  get_career_timeline: careerTimeline,
  get_skills: () => ({ radar: SKILLS.radar, tech_bars: SKILLS.techBars }),
  get_publications: () => ({ publications: WRITING }),
  get_honours: () => ({ honours: HONOURS.map(({ title, url }) => ({ title, url })), education: EDUCATION }),
  get_youtube_videos: videos,
}

const SCRIPTS = [
  {
    match: /robot|project|build/i, tools: ['get_projects'],
    thinking: 'They want the robots. Pull the projects, lead with Noir Rover and Vector, keep it short and point at the cards.',
    text: "Three of them have wheels or treads, and all of them talk back.\n\n**Noir Rover** is an agentic Moorebot Scout that keeps a diary about you, with citations. **Vector Desk AI** gives an Anki Vector a local LLM brain: it scored **98.0%** across 118 behaviour scenarios. **Q-Pocket-AI** runs vision on an Arduino UNO Q and answers in about 180 ms.\n\nThe cards below have the rest. Want the build log for any of them?",
  },
  {
    match: /career|timeline|experience|work/i, tools: ['get_career_timeline'],
    thinking: 'Career question. Timeline tool, then a three-beat summary: IRIS, VAIA, BLUE.',
    text: "Short version: **three video AI platforms in eight years.**\n\n1. **IRIS** at Integration Wizards, built on NVIDIA DeepStream. It reached 25+ enterprise customers, and the company was acquired.\n2. **VAIA** at Avathon, the SDK that cross-compiles between dGPU servers and Jetson.\n3. **BLUE**, where he is Director AI - BLUE: a semantic video data lake for the cameras you already own.\n\nThe full timeline is below.",
  },
  {
    match: /talk|video|gtc|youtube/i, tools: ['get_youtube_videos'],
    thinking: 'Videos. Fetch the feed and point at the GTC 2025 session first.',
    text: "He has been on the **NVIDIA GTC** stage twice: a 2025 session for HP on on-prem LLM development, and two live demos at GTC 2024. The latest tapes are below.",
  },
  {
    match: /error/i, tools: [], error: 'Veronica lost the connection. Try again in a moment.',
    thinking: 'Simulating a failure.', text: 'Let me check that for y',
  },
  {
    match: /.*/, tools: [],
    thinking: 'A general question. Answer from the bio, keep it to three sentences, offer a next step.',
    text: "**Akash James is Director AI - BLUE**, in Bengaluru. He builds computer vision and generative AI that understands video, then stands in front of customers and sells it.\n\nAsk me about the robots, his career, or the GTC talks. Or try [the contact form](#/versus) if you would rather talk to him directly.",
  },
]

export function mockStream({ text, onEvent, onDone }) {
  const slow = /[?&]mock=slow\b/.test(location.hash) ? 10 : 1
  const s = SCRIPTS.find(x => x.match.test(text))
  const timers = []
  let closed = false
  let t = 0
  const at = (ms, fn) => { t += ms * slow; timers.push(setTimeout(() => { if (!closed) fn() }, t)) }
  for (const chunk of s.thinking.match(/.{1,14}/g)) at(45, () => onEvent({ t: 'thinking', v: chunk }))
  for (const name of s.tools) {
    at(300, () => onEvent({ t: 'tool', name, status: 'running' }))
    at(900, () => onEvent({ t: 'block', name, data: RESULTS[name]() }))
  }
  for (const word of s.text.match(/\S+\s*/g)) at(28, () => onEvent({ t: 'text', v: word }))
  if (s.error) at(200, () => onEvent({ t: 'error', v: s.error }))
  at(120, () => onDone())
  return { close() { closed = true; timers.forEach(clearTimeout) } }
}

export const mockEnabled = () => import.meta.env.DEV && /[?&]mock=/.test(location.hash)

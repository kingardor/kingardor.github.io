/**
 * Maps the existing src/data.js named exports to the DATA shape expected
 * by the prototype components. Keeps src/data.js untouched so ChatPage.jsx
 * and other consumers continue to work.
 *
 * Fields marked // TODO: confirm copy are populated from handoff placeholders
 * because no equivalent exists in src/data.js — confirm with user before shipping.
 */

import {
  NOW_ROLES,
  PAST_ROLES,
  HONOURS as RAW_HONOURS,
  PROJECTS as RAW_PROJECTS,
  MEDIUM_POSTS,
  YT_VIDEOS,
  LINKS,
} from '../../data.js';

/* ── Career: NOW_ROLES first, then PAST_ROLES ── */
const allRoles = [...NOW_ROLES, ...PAST_ROLES];
const career = allRoles.map((r, i) => {
  const yearMatch = r.period.match(/\b(20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : 'NOW';
  const yearShort = year === 'NOW' ? 'NOW' : year.slice(2);
  return {
    num: String(i + 1).padStart(2, '0'),
    role: r.title,
    org: r.org,
    period: r.period,
    year,
    yearShort,
    live: i === 0,
    blurb: r.blurb,
    tags: r.tags || [],
    capt: i === 0 ? 'CURRENTLY ORCHESTRATING' : `CHAPTER ${String(i + 1).padStart(2, '0')}`,
  };
});

/* ── Honours ── */
const honours = RAW_HONOURS.map(h => {
  const k = h.title.split(':')[0].toUpperCase().trim();
  return { k, t: h.title };
});
// Add ambassador if not already covered
honours.push(
  { k: 'NVIDIA',   t: 'Jetson AI Ambassador · Deep Learning Institute instructor' },
  { k: 'SPEAKING', t: 'GTC · NeurIPS meetups · AI Engineer Summit · 20+ conferences' }, // TODO: confirm count
  { k: 'CREATOR',  t: 'YouTube channel on applied AI' },
);

/* ── Projects: pin Veronica first, then GitHub repos ── */
const veronicaCard = {
  code: 'PRJ · 01',
  name: 'Veronica',
  feature: true,
  desc: 'A British-inflected, slightly menacing cognitive agent that represents me on the web. Agentic tool loop over a custom portfolio API; streams thinking, tools, and structured blocks. Lives on Vercel + OpenRouter.',
  tags: ['AGENTS', 'SSE', 'FASTAPI', 'OPENROUTER'],
  href: '#/chat',
};
const staticProjects = [
  veronicaCard,
  ...RAW_PROJECTS.slice(0, 5).map((p, i) => ({
    code: `PRJ · ${String(i + 2).padStart(2, '0')}`,
    name: p.name,
    desc: p.desc,
    tags: p.tags.map(t => t.toUpperCase()),
    href: p.url,
  })),
];

/* ── Writing: map MEDIUM_POSTS → writing rows ── */
const writing = MEDIUM_POSTS.map((p, i) => ({
  idx: String(i + 1).padStart(3, '0'),
  title: p.title,
  tag: 'BLOG',
  href: p.url,
}));

/* ── Videos: use YT_VIDEOS static list as fallback skeleton ── */
const staticVideos = {
  featured: { num: '01', title: 'Latest video', url: YT_VIDEOS[0] || null, thumb: null },
  strip: YT_VIDEOS.slice(1).map((url, i) => ({ num: String(i + 2).padStart(2, '0'), title: '', url, thumb: null })),
};

/* ── Socials ── */
const socials = [
  { k: 'EMAIL',    v: 'akashjamesofficial@gmail.com', href: LINKS.email },
  { k: 'GITHUB',   v: '/kingardor',                   href: 'https://github.com/kingardor' },
  { k: 'LINKEDIN', v: '/akashjames',                  href: LINKS.linkedin },
  { k: 'MEDIUM',   v: 'akash-james.medium.com',       href: LINKS.medium },
  { k: 'TWITTER',  v: '@king_ardor',                  href: LINKS.twitter },
];

export const DATA = {
  profile: {
    name: 'AKASH JAMES',
    role: 'AI ARCHITECT · DIRECTOR OF AI',
    org: NOW_ROLES[0]?.org || 'MyBlue.ai',
    location: 'SAN FRANCISCO, CA', // TODO: confirm location
    tz: 'PST · UTC-8',             // TODO: confirm timezone
    status: 'OPEN TO OUTRAGEOUS WORK', // TODO: confirm status line
    tagline: 'Vision, voice, language — at scale, on the edge, and everywhere in between.', // TODO: confirm tagline
  },

  contactEmail: 'akashjamesofficial@gmail.com',

  // TODO: confirm all four stat numbers
  stats: [
    { num: '8+',  label: 'YEARS IN AI',      sub: 'Vision, NLP, agentic systems' },
    { num: '50+', label: 'SHIPPED MODELS',   sub: 'Prod-grade, not demos' },
    { num: '3',   label: 'ECOSYSTEMS',       sub: 'NVIDIA · HF · OpenRouter' },
    { num: '∞',   label: 'COFFEE UNITS',     sub: 'Required fuel' },
  ],

  // TODO: rewrite manifesto in Akash's own voice before shipping
  manifesto: [
    { txt: 'I design AI' },
    { txt: 'that behaves' },
    { txt: 'less like a feature' },
    { txt: 'and more like' },
    { txt: 'a collaborator', accent: true },
    { txt: '—' },
    { txt: 'systems that reason,' },
    { txt: 'that watch,' },
    { txt: 'that listen,' },
    { txt: 'that decide.' },
    { txt: 'Eight years' },
    { txt: 'teaching machines' },
    { txt: 'to see the world', accent: true },
    { txt: 'and occasionally' },
    { txt: 'to talk back.' },
  ],

  // TODO: confirm skillsSentence and keyWords
  skillsSentence:
    'I work primarily in PyTorch and TensorRT, ship agents with LangGraph and DSPy, index reality in Qdrant, stream inference through DeepStream, squeeze models with CUDA, and let Claude do the typing.',
  keyWords: ['PyTorch', 'TensorRT', 'LangGraph', 'DSPy', 'Qdrant', 'DeepStream', 'CUDA', 'Claude'],

  skillGroups: [
    { idx: '01', name: 'Vision & Edge',  items: ['DeepStream', 'TensorRT', 'Triton', 'ONNX', 'OpenCV', 'CUDA'],     huge: 'V' },
    { idx: '02', name: 'Agents & LLMs',  items: ['LangGraph', 'DSPy', 'OpenRouter', 'vLLM', 'RAG', 'Tool Use'],      huge: 'A' },
    { idx: '03', name: 'Modeling',       items: ['PyTorch', 'TensorFlow', 'JAX', 'Transformers', 'Diffusion', 'RL'], huge: 'M' },
    { idx: '04', name: 'Infra',          items: ['AWS', 'GCP', 'Kubernetes', 'FastAPI', 'Qdrant', 'Redis'],          huge: 'I' },
  ],

  career,
  honours,
  projects: staticProjects,
  videos: staticVideos,
  writing,
  socials,
};

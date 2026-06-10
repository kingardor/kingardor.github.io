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
  let k = h.title.split(':')[0].toUpperCase().trim();
  if (k.length > 12) k = k.split(/\s+/)[0]; // titles without a colon: first word only
  return { k, t: h.title, href: h.url || null };
});
honours.push(
  { k: 'NVIDIA',   t: 'Jetson AI Ambassador · Deep Learning Institute instructor', href: null },
  { k: 'SPEAKING', t: 'GTC · NeurIPS meetups · AI Engineer Summit · 20+ conferences', href: null },
  { k: 'CREATOR',  t: 'YouTube channel on applied AI', href: null },
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
const ytThumb = (url) => {
  const m = url?.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return m ? `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` : null;
};
const staticVideos = {
  featured: { num: '01', title: '', url: YT_VIDEOS[0] || null, thumb: ytThumb(YT_VIDEOS[0]) },
  strip: YT_VIDEOS.slice(1).map((url, i) => ({ num: String(i + 2).padStart(2, '0'), title: '', url, thumb: ytThumb(url) })),
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
    role: 'AI ARCHITECT · FOUNDING DIRECTOR @ BLUE',
    org: NOW_ROLES[0]?.org || 'BLUE',
    location: 'BENGALURU, INDIA',
    tz: 'IST · UTC+5:30',
    status: 'OPEN TO OUTRAGEOUS WORK',
    tagline: 'GPU to prod. Agents that close loops. Vision at the edge and everywhere in between.',
  },

  contactEmail: 'akashjamesofficial@gmail.com',

  // TODO: confirm all four stat numbers
  stats: [
    { num: '8+',  label: 'YEARS IN AI',      sub: 'Vision, NLP, agentic systems' },
    { num: '50+', label: 'SHIPPED MODELS',   sub: 'Prod-grade, not demos' },
    { num: '∞',   label: 'COFFEE UNITS',     sub: 'Required fuel' },
    { num: '3',   label: 'PLATFORMS BUILT',   sub: 'IRIS · VAIA · myBLUE' },
    { num: '1',   label: 'ACQUISITION',      sub: 'Exit achieved' },
  ],

  manifesto: [
    { txt: 'I build AI' },
    { txt: 'that ships.' },
    { txt: 'Not demos' },
    { txt: 'production systems', accent: true },
    { txt: 'that hit the latency target,' },
    { txt: 'that scale,' },
    { txt: 'that earn revenue.' },
    { txt: 'Eight years' },
    { txt: 'on GPUs,' },
    { txt: 'on Jetson hardware,' },
    { txt: 'on the bleeding edge', accent: true },
    { txt: 'of what\'s possible.' },
  ],

  skillsSentence:
    "The tool is a detail. The outcome isn't. I architect the fastest path from concept to production AI — quantised vision models on Jetson edge hardware, agentic orchestration that closes loops without a human in the chain, hybrid RAG pipelines that retrieve at scale. Eight years on GPUs. Three platforms built from scratch. One acquisition. Now Founding Director at BLUE, operating at altitude. The bar hasn't moved: it ships, it scales, it earns.",
  keyWords: ['Jetson', 'RAG', 'GPUs', 'BLUE'],

  skillGroups: [
    { idx: '01', name: 'Vision & Edge',  items: ['DeepStream', 'TensorRT', 'OpenCV', 'ONNX', 'CUDA', 'Jetson'],     huge: 'V' },
    { idx: '02', name: 'Agents & LLMs',  items: ['CrewAI', 'LangGraph', 'LoRA', 'RAG', 'OpenRouter', 'Tool Use'],   huge: 'A' },
    { idx: '03', name: 'Modeling',       items: ['PyTorch', 'TensorFlow', 'Transformers', 'Diffusion', 'JAX', 'RL'], huge: 'M' },
    { idx: '04', name: 'Infra',          items: ['FastAPI', 'Docker', 'Qdrant', 'Redis', 'AWS', 'Kubernetes'],       huge: 'I' },
  ],

  career,
  honours,
  projects: staticProjects,
  videos: staticVideos,
  writing,
  socials,
};

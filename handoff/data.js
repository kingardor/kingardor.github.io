/*
 * Portfolio content. Most fields are PLACEHOLDER COPY inferred from the
 * source repos — every `// TODO:` marker flags content to replace with
 * real, user-approved copy before shipping.
 *
 * Integration targets (wire these to real APIs, don't leave them static):
 *   • projects → your existing GitHub repo fetch (keep featured priority)
 *   • videos   → your existing /api/youtube-feed call
 *   • writing  → your existing Medium rail fetch
 *   • career, honours, skillGroups → live in veronica-proxy-vercel/api/index.py;
 *     lift into a shared source of truth or keep hardcoded here.
 */

export const DATA = {
  profile: {
    name: 'AKASH JAMES',
    role: 'AI ARCHITECT · DIRECTOR OF AI',     // TODO: confirm current title
    org: 'MyBlue.ai',                          // TODO: confirm
    location: 'SAN FRANCISCO, CA',             // TODO: confirm
    tz: 'PST · UTC-8',
    status: 'OPEN TO OUTRAGEOUS WORK',         // TODO: confirm or customize
    tagline:
      'I build AI systems that ship. Vision, voice, language — at scale, on the edge, and everywhere in between.',
  },

  contactEmail: 'akash@akashjames.dev',        // TODO: confirm

  // TODO: all 4 numbers are placeholder — confirm or replace
  stats: [
    { num: '12+', label: 'YEARS IN AI',       sub: 'Vision, NLP, agentic systems' },
    { num: '50+', label: 'SHIPPED MODELS',    sub: 'Prod-grade, not demos' },
    { num: '3',   label: 'ECOSYSTEMS',        sub: 'NVIDIA · HF · OpenRouter' },
    { num: '∞',   label: 'COFFEE UNITS',      sub: 'Required fuel' },
  ],

  // Manifesto copy — scroll-driven word fade. Each word is one element.
  // TODO: rewrite in Akash's own voice. Mark `accent: true` to highlight a word.
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
    { txt: 'Twelve years' },
    { txt: 'teaching machines' },
    { txt: 'to see the world', accent: true },
    { txt: 'and occasionally' },
    { txt: 'to talk back.' },
  ],

  // Career timeline. CAUTION: dates/orgs/blurbs are inferred — CONFIRM with Akash.
  // Source of truth lives in veronica-proxy-vercel/api/index.py — consider lifting.
  career: [
    {
      num: '01', role: 'Director of AI', org: 'MyBlue.ai',   // TODO
      period: '2024 — PRESENT', year: 'NOW', yearShort: 'NOW', live: true,
      blurb: 'TODO: replace with real blurb for current role.',
      tags: ['AGENTS', 'MULTIMODAL', 'STRATEGY', 'HIRING'],
      capt: 'CURRENTLY ORCHESTRATING',
    },
    {
      num: '02', role: 'AI Architect', org: 'Sahara AI',      // TODO confirm org+dates
      period: '2022 — 2024', year: '2022', yearShort: '22',
      blurb: 'TODO: replace with real blurb.',
      tags: ['DEEPSTREAM', 'CUDA', 'TRITON', 'EDGE'],
      capt: 'VISION AT THE EDGE',
    },
    {
      num: '03', role: 'Senior ML Engineer', org: 'Skylark Labs',  // TODO
      period: '2020 — 2022', year: '2020', yearShort: '20',
      blurb: 'TODO: replace with real blurb.',
      tags: ['DRONES', 'DETECTION', 'TRACKING', 'PYTORCH'],
      capt: 'EYES IN THE SKY',
    },
    {
      num: '04', role: 'AI Engineer', org: 'Intel / NVIDIA ecosystem',  // TODO
      period: '2016 — 2020', year: '2016', yearShort: '16',
      blurb: 'TODO: replace with real blurb.',
      tags: ['QUANTIZATION', 'OPENVINO', 'C++', 'FUNDAMENTALS'],
      capt: 'LEARNING TO BUILD',
    },
  ],

  // Skills one-liner shown as oversized pull quote. Words in `keyWords` get accent.
  skillsSentence:
    'I work primarily in PyTorch and TensorRT, ship agents with LangGraph and DSPy, index reality in Qdrant, stream inference through DeepStream, squeeze models with CUDA, and let Claude do the typing.',
  keyWords: ['PyTorch', 'TensorRT', 'LangGraph', 'DSPy', 'Qdrant', 'DeepStream', 'CUDA', 'Claude'],

  skillGroups: [
    { idx: '01', name: 'Vision & Edge',   items: ['DeepStream', 'TensorRT', 'Triton', 'ONNX', 'OpenCV', 'CUDA'],       huge: 'V' },
    { idx: '02', name: 'Agents & LLMs',   items: ['LangGraph', 'DSPy', 'OpenRouter', 'vLLM', 'RAG', 'Tool Use'],         huge: 'A' },
    { idx: '03', name: 'Modeling',        items: ['PyTorch', 'TensorFlow', 'JAX', 'Transformers', 'Diffusion', 'RL'],    huge: 'M' },
    { idx: '04', name: 'Infra',           items: ['AWS', 'GCP', 'Kubernetes', 'FastAPI', 'Qdrant', 'Redis'],             huge: 'I' },
  ],

  // Projects — REPLACE with GitHub API fetch + featured-repo priority.
  // Add `href` to each to make cards clickable.
  projects: [
    {
      code: 'PRJ · 01', name: 'Veronica', feature: true,
      desc:
        'A British-inflected, slightly menacing cognitive agent that represents me on the web. Agentic tool loop over a custom portfolio API; streams thinking, tools, and structured blocks. Lives on Vercel + OpenRouter.',
      tags: ['AGENTS', 'SSE', 'FASTAPI', 'OPENROUTER'],
      href: '#/chat',
    },
    { code: 'PRJ · 02', name: 'EdgeLens',   desc: 'TODO: real project copy.', tags: ['JETSON', 'DEEPSTREAM', 'INT8'] },
    { code: 'PRJ · 03', name: 'ForgeRAG',   desc: 'TODO: real project copy.', tags: ['RAG', 'QDRANT', 'LLMS'] },
    { code: 'PRJ · 04', name: 'AutoTriage', desc: 'TODO: real project copy.', tags: ['AGENTS', 'LANGGRAPH'] },
    { code: 'PRJ · 05', name: 'DroneSight', desc: 'TODO: real project copy.', tags: ['DRONES', 'TRACKING'] },
  ],

  // Videos — REPLACE with /api/youtube-feed output. Structure: featured + strip[].
  videos: {
    featured: { num: '01', title: 'Building an Agentic Multimodal System with DeepStream & vLLM', thumb: null },
    strip: [
      { num: '02', title: 'TensorRT INT8 deep-dive' },
      { num: '03', title: 'RAG that actually works' },
      { num: '04', title: 'Jetson deployment patterns' },
      { num: '05', title: 'Prompt engineering for agents' },
      { num: '06', title: 'Vision + LLMs: the stack' },
    ],
  },

  // Writing — REPLACE with Medium rail. Add `href` per row.
  writing: [
    { idx: '001', title: 'The quiet tyranny of the demo-first AI industry',          tag: 'ESSAY' },
    { idx: '002', title: 'Why your RAG is slow, and the three things to fix first',  tag: 'PRACTICE' },
    { idx: '003', title: 'Notes on building Veronica: agents that feel less scripted', tag: 'FIELD NOTES' },
    { idx: '004', title: 'INT8 quantization without regret',                          tag: 'DEEP DIVE' },
    { idx: '005', title: 'The hiring bar for AI engineers, from the other side of the table', tag: 'OPINION' },
  ],

  honours: [
    { k: 'NVIDIA',   t: 'Jetson AI Ambassador · Deep Learning Institute instructor' },
    { k: 'SPEAKING', t: 'GTC · NeurIPS meetups · AI Engineer Summit · 20+ conferences' },  // TODO confirm count
    { k: 'ADVISORY', t: 'Technical advisor to three early-stage AI startups' },            // TODO confirm
    { k: 'CREATOR',  t: 'YouTube channel, 12k+ subscribers on applied AI' },               // TODO confirm count
  ],

  // Socials — add `href` per row to make clickable.
  socials: [
    { k: 'EMAIL',    v: 'akash@akashjames.dev',  href: 'mailto:akash@akashjames.dev' },  // TODO confirm
    { k: 'GITHUB',   v: '/kingardor',            href: 'https://github.com/kingardor' },
    { k: 'LINKEDIN', v: '/akashajames',          href: 'https://linkedin.com/in/akashajames' },  // TODO confirm
    { k: 'YOUTUBE',  v: '@akashjames',           href: 'https://youtube.com/@akashjames' },      // TODO confirm
    { k: 'X',        v: '@akashjames_ai',        href: 'https://x.com/akashjames_ai' },          // TODO confirm
  ],
};

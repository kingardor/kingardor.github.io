// Single source of truth for site content. Imported by the SPA (src/) and by
// the Veronica Worker (worker/index.js, bundled by wrangler) so what the page
// shows and what Veronica says can never drift apart. Plain data only — no
// DOM, no React, no Worker APIs.

export const ASSISTANT = {
  name: 'Veronica',
  acronym: 'Versatile Online Intelligent Cognitive Agent',
  initials: ['V', 'O', 'I', 'C', 'A'],
}

export const CHAT_SUGGESTIONS = [
  'Give me a 10-sec intro',
  'Show your top 3 projects',
  'What’s your current stack?',
  'Link the NVIDIA GTC talk',
  'How can I contact you?',
]

export const EMAIL = 'akashjamesofficial@gmail.com'

export const LINKS = {
  linkedin: 'https://linkedin.com/in/akashjames',
  medium: 'https://akash-james.medium.com',
  github: 'https://github.com/kingardor',
  twitter: 'https://twitter.com/king_ardor',
  instagram: 'https://instagram.com/lifeofakashjames',
  email: `mailto:${EMAIL}`,
}

export const PROFILE = {
  name: 'Akash James',
  role: 'AI Architect · Founding Director @ BLUE',
  bioTagline: 'Generative AI Architect · Open-source builder · Tech influencer',
  tagline: 'GPU to prod. Agents that close loops. Vision at the edge and everywhere in between.',
  location: 'Bengaluru, India',
  tz: 'IST · UTC+5:30',
  status: 'Open to outrageous work',
  currentFocus: 'Video-first data lake with agentic multimodal RAG and graph-native retrieval (Qdrant, CrewAI, LLMs)',
  highlights: [
    '3 AI platforms built 0→1, end-to-end',
    '50+ production use-cases designed & shipped',
    '10+ multimodal platforms (vision · language · audio)',
    '1 product acquisition outcome',
  ],
  affiliations: [
    'Z by HP Global Data Science Ambassador',
    'NVIDIA Jetson AI Research Lab collaborator',
  ],
}

// Newest first. `current` marks the live chapter.
export const CAREER = [
  {
    role: 'Director of AI', org: 'MyBlue.ai', period: 'Mar 2025 — Present',
    startYear: 2025, endYear: null, current: true,
    blurb: 'Building a video data lake with full agentic capabilities (multimodal RAG, LLM tools, graph-native retrieval).',
    tags: ['GenAI', 'Agentic', 'Video', 'RAG', 'Qdrant'],
  },
  {
    role: 'Lead AI Architect', org: 'SparkCognition', period: 'Aug 2022 — 2025',
    startYear: 2022, endYear: 2025,
    blurb: 'Roadmapped and led SC’s Visual AI Advisor (VAIA). Patented a low-resource face recognition pipeline; built cross-cam re-ID; shipped SDKs.',
    tags: ['Computer Vision', 'DeepStream', 'TensorRT', 'Product'],
  },
  {
    role: 'Visiting Research Scholar', org: 'UC Berkeley', period: '2023',
    startYear: 2023, endYear: 2024,
    blurb: 'Wildfire detection research: low-latency pipeline across ~1k CalTrans CCTVs; YOLO-based smoke/fire detection.',
    tags: ['Research', 'CV', 'Edge AI'],
  },
  {
    role: 'AI Architect', org: 'Integration Wizards', period: '2020 — 2022',
    startYear: 2020, endYear: 2022,
    blurb: 'Designed high-FPS video analytics on GPUs (DeepStream), modular IRIS pipeline (−75% time-to-deploy).',
    tags: ['CUDA', 'Pipelines', 'Analytics'],
  },
]

// Curated, in display order. `repo` is the GitHub source; `href` overrides
// where the card links on the site; `slug` marks a case-study page.
export const PROJECTS = [
  {
    slug: 'veronica', name: 'Veronica', featured: true, href: '#/chat',
    repo: null,
    desc: 'A British-inflected, slightly menacing cognitive agent that represents me on the web. Agentic tool loop over the portfolio’s own content; streams thinking, tool calls and structured blocks. Runs on Cloudflare Workers + OpenRouter.',
    tags: ['Agents', 'SSE', 'Cloudflare Workers', 'OpenRouter'],
  },
  {
    slug: 'hermes', name: 'Hermes — Wildfire Detection',
    repo: 'https://github.com/kingardor/Hermes-Deepstream',
    desc: 'Drone-assisted wildfire detection on Jetson Xavier NX using DeepStream + YOLO; RTSP bridge for Tello.',
    tags: ['Jetson', 'DeepStream', 'YOLO'],
  },
  {
    slug: 'vector', name: 'Vector + Advanced AI',
    repo: 'https://github.com/kingardor/vector-advanced-ai',
    desc: 'Hacking Anki Vector with advanced AI capabilities. Because why not.',
    tags: ['Robotics', 'LLM'],
  },
  {
    slug: 'activity-recognition', name: 'Activity Recognition — TensorRT',
    repo: 'https://github.com/kingardor/Activity-Recognition-TensorRT',
    desc: '3D-ResNet video classification optimized with TensorRT for real-time action recognition.',
    tags: ['TensorRT', 'Video', '3D-CNN'],
  },
  {
    name: 'YOLOv4 — OpenCV CUDA DNN',
    repo: 'https://github.com/kingardor/YOLOv4-OpenCV-CUDA-DNN',
    desc: 'Run YOLOv4 directly in OpenCV’s CUDA DNN backend for fast GPU inference.',
    tags: ['OpenCV', 'CUDA'],
  },
  {
    name: 'CenterFace — DeepStream',
    repo: 'https://github.com/kingardor/Centerface-Deepstream',
    desc: 'CenterFace (ONNX) accelerated on DeepStream 5.1 with custom output parsers.',
    tags: ['Face', 'ONNX', 'DeepStream'],
  },
  {
    name: 'Shred FPS Opponents',
    repo: 'https://github.com/kingardor/ShredFPSOpponents',
    desc: 'Pipe game frames → YOLOv3 → detect opponents in real time.',
    tags: ['Gaming', 'YOLO'],
  },
]

export const SKILLS = {
  radar: [
    { domain: 'GenAI', score: 95 },
    { domain: 'RAG/Retrieval', score: 92 },
    { domain: 'Architecture', score: 90 },
    { domain: 'Edge AI', score: 85 },
    { domain: 'MLOps', score: 80 },
    { domain: 'Infrastructure', score: 75 },
  ],
  techBars: [
    { tech: 'PyTorch', years: 5, level: 'Expert' },
    { tech: 'CUDA', years: 5, level: 'Expert' },
    { tech: 'Docker/GPU', years: 5, level: 'Expert' },
    { tech: 'FastAPI', years: 4, level: 'Expert' },
    { tech: 'TensorRT', years: 4, level: 'Expert' },
    { tech: 'DeepStream', years: 4, level: 'Expert' },
    { tech: 'LangChain', years: 3, level: 'Advanced' },
    { tech: 'CrewAI/Agents', years: 3, level: 'Advanced' },
    { tech: 'Qdrant', years: 3, level: 'Advanced' },
    { tech: 'Kubernetes', years: 2, level: 'Proficient' },
  ],
  groups: [
    { name: 'Vision & Edge', items: ['DeepStream', 'TensorRT', 'OpenCV', 'ONNX', 'CUDA', 'Jetson'] },
    { name: 'Agents & LLMs', items: ['CrewAI', 'LangGraph', 'LoRA', 'RAG', 'OpenRouter', 'Tool Use'] },
    { name: 'Modeling', items: ['PyTorch', 'TensorFlow', 'Transformers', 'Diffusion', 'JAX', 'RL'] },
    { name: 'Infra', items: ['FastAPI', 'Docker', 'Qdrant', 'Redis', 'AWS', 'Kubernetes'] },
  ],
}

export const WRITING = [
  { title: 'Blaze through your setup with Z by HP Data Science Stack Manager', url: 'https://akash-james.medium.com/simplifying-data-science-workflows-an-overview-of-z-by-hp-data-science-stack-manager-5084d681bf48', platform: 'Medium' },
  { title: 'What it takes to be an Artificial Intelligence Architect', url: 'https://akash-james.medium.com/what-it-takes-to-be-an-artificial-intelligence-architect-ed7757c504fb', platform: 'Medium' },
  { title: 'What it takes to be a Deep Learning Engineer', url: 'https://akash-james.medium.com/what-it-takes-to-be-a-deep-learning-engineer-805103806148', platform: 'Medium' },
  { title: 'Train models like a pro with NVIDIA TLT 3.0', url: 'https://akash-james.medium.com/train-models-like-a-pro-with-nvidia-tlt-3-0-54ea20467661', platform: 'Medium' },
  { title: 'YOLOv4 with CUDA-powered OpenCV DNN', url: 'https://akash-james.medium.com/yolov4-with-cuda-powered-opencv-dnn-2fef48ea3984', platform: 'Medium' },
  { title: 'How an AI organisation can make a difference during the pandemic', url: 'https://akash-james.medium.com/how-an-ai-organisation-can-make-a-difference-during-the-pandemic-db63ee396df9', platform: 'Medium' },
  { title: 'Computer Vision: A Step Closer to Skynet', url: 'https://akash-james.medium.com/computer-vision-a-step-closer-to-skynet-9a3692eee243', platform: 'Medium' },
]

export const HONOURS = [
  { key: 'PATENT', title: 'Patent: Face Image Matching based on Feature Comparison', url: 'https://www.ipqwery.com/ipowner/en/owner/ip/1255518-sparkcognition-inc.html' },
  { key: 'Z BY HP', title: 'Ambassador of the Month — Z by HP', url: 'https://community.datascience.hp.com/community-spotlight-55/ambassador-of-the-month-akash-james-232' },
  { key: 'NVIDIA', title: 'Jetson AI Ambassador · Deep Learning Institute instructor', url: null },
  { key: 'SPEAKING', title: 'GTC · NeurIPS meetups · AI Engineer Summit · 20+ conferences', url: null },
  { key: 'CREATOR', title: 'YouTube channel on applied AI', url: null },
]

// Fallback list; the live feed comes from /api/youtube-feed.
export const VIDEOS = [
  'https://www.youtube.com/watch?v=1VQXLXshKNY',
  'https://www.youtube.com/watch?v=J0fhEByPzVQ',
]

// TODO(akash): confirm these numbers before launch.
export const STATS = [
  { num: '8+', label: 'Years in AI', sub: 'Vision, NLP, agentic systems' },
  { num: '50+', label: 'Shipped models', sub: 'Prod-grade, not demos' },
  { num: '∞', label: 'Coffee units', sub: 'Required fuel' },
  { num: '3', label: 'Platforms built', sub: 'IRIS · VAIA · myBLUE' },
  { num: '1', label: 'Acquisition', sub: 'Exit achieved' },
]

export const MANIFESTO = [
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
]

export const SKILLS_SENTENCE =
  "The tool is a detail. The outcome isn't. I architect the fastest path from concept to production AI — quantised vision models on Jetson edge hardware, agentic orchestration that closes loops without a human in the chain, hybrid RAG pipelines that retrieve at scale. Eight years on GPUs. Three platforms built from scratch. One acquisition. Now Founding Director at BLUE, operating at altitude. The bar hasn't moved: it ships, it scales, it earns."

export const KEY_WORDS = ['Jetson', 'RAG', 'GPUs', 'BLUE']

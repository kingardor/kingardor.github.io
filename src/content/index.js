// Single source of truth for site content. Imported by the SPA (src/) and by
// the Veronica Worker (worker/index.js, bundled by wrangler) so what the page
// shows and what Veronica says can never drift apart. Plain data only — no
// DOM, no React, no Worker APIs.
//
// Sources: LinkedIn (/in/akashjames, read Nov 2026), the project READMEs,
// GitHub, Medium and the YouTube channel feed. Every number below is one of
// those sources' numbers. The swagger is ours; the facts are not invented.

export const ASSISTANT = {
  name: 'Veronica',
  acronym: 'Versatile Online Intelligent Cognitive Agent',
  initials: ['V', 'O', 'I', 'C', 'A'],
}

export const CHAT_SUGGESTIONS = [
  'Give me a 10-sec intro',
  'What is Hyper Memory?',
  'Show me the robots',
  'Link the NVIDIA GTC talk',
  'How can I contact you?',
]

export const EMAIL = 'akashjamesofficial@gmail.com'

export const LINKS = {
  linkedin: 'https://linkedin.com/in/akashjames',
  medium: 'https://akash-james.medium.com',
  github: 'https://github.com/kingardor',
  youtube: 'https://www.youtube.com/channel/UCgJZkbxrBpbuHv4jOFuR8zQ',
  twitter: 'https://twitter.com/king_ardor',
  instagram: 'https://instagram.com/lifeofakashjames',
  blue: 'https://myblue.ai',
  copcars: 'https://copcars.in',
  email: `mailto:${EMAIL}`,
}

export const PROFILE = {
  name: 'Akash James',
  pronouns: 'he/him',
  role: 'Director AI - BLUE',
  headline: 'Cameras record everything and remember nothing. I’m fixing that.',
  bioTagline: 'Director AI - BLUE · computer vision, VLMs, AI agents, edge AI · NVIDIA GTC speaker · ex-UC Berkeley',
  tagline: 'I make machines see, remember and talk back. Then I sell them.',
  location: 'Bengaluru, India',
  tz: 'IST · UTC+5:30',
  status: 'Currently teaching CCTV to remember',
  currentFocus:
    'BLUE: the world’s first semantic video data lake for the CCTV cameras you already own. Hyper Memory, BLUE Agent, Helyx, BLUE Copilot, BLUE Mini Edge, and the GPU stack under all of it, down to NVIDIA Jetson Thor.',
  bio: [
    'I’m Akash James, Director AI at BLUE, in Bengaluru. For 8+ years I’ve built computer vision and generative AI that understands video, taken it to production, and then stood in front of customers and sold it. In every role I’ve demoed the product and helped close the deal.',
    'Three video AI platforms built. One of them got its company acquired. ~1,000 Caltrans cameras watched for wildfire at UC Berkeley. Two NASA Space Apps wins. The NVIDIA GTC stage. 100+ students coached on Jetson.',
    'After hours I build robots with attitude problems, a fully local assistant with her own team of agents, and a diecast store that takes real money. When I’m not coding, I beatbox.',
  ],
  highlights: [
    '3 video AI platforms built: IRIS, VAIA and BLUE',
    '50+ models shipped to production',
    'IRIS: 25+ enterprise customers, thousands of sites, then an acquisition',
    'Wildfire detection across ~1,000 Caltrans CCTV cameras at UC Berkeley',
    'NVIDIA GTC 2025 speaker; two demos at GTC 2024',
    '100+ students coached as an NVIDIA Jetson AI Ambassador',
    'Two-time NASA Space Apps winner',
  ],
  affiliations: [
    'Z by HP Global Data Science Ambassador (2023–2025)',
    'NVIDIA Jetson AI Ambassador (2021–2025)',
    'NVIDIA Jetson AI Research Lab member',
  ],
  followers: { linkedin: '9.6k', github: 189 },
}

// One-liners with receipts. `by` is who said it first.
export const ONE_LINERS = [
  { line: 'Cameras record everything and remember nothing. I’m fixing that.', by: 'Akash' },
  { line: 'Conventional video analytics is a very expensive way to not know what happened.', by: 'Akash' },
  { line: 'Nobody built that dashboard. Your questions did.', by: 'Akash, on BLUE Agent' },
  { line: 'I like systems that move money and move needles.', by: 'Akash' },
  { line: 'Comparing myself to Ultron would be like comparing a supernova to a firecracker.', by: 'Vector, 2024' },
  { line: 'You’re just a tool. I’ll keep it that way.', by: 'Vector, to a rude user' },
  { line: 'A mug is in front of me.', by: 'Noir, 4.15 seconds after being asked' },
]

// Newest first. `current` marks a live chapter; `kind` lets layouts split
// day jobs from ambassadorships and side ventures.
export const CAREER = [
  {
    role: 'Director AI', org: 'BLUE', orgUrl: 'https://myblue.ai', kind: 'role',
    period: 'Mar 2025 — Present', startYear: 2025, endYear: null, current: true,
    location: 'Bengaluru · on-site',
    blurb: 'Building the world’s first semantic video data lake for the CCTV you already own. I head AI across BLUE, end to end: models, research, products and the platform they run on. In stealth until Feb 2026.',
    wins: [
      'Hyper Memory: footage read once into structured memory and a self-building knowledge graph. 55% fewer tokens than JSON, 73% fewer model calls.',
      'BLUE Agent: one agent over every camera, site and recording, with generative UI and every number verified against source.',
      'Helyx: VLM prompts that evolve themselves, on Mendel-James, a gene-based algorithm I designed.',
      'BLUE Copilot, BLUE Mini Edge, and vLLM serving from RTX Pro 6000 down to NVIDIA Jetson Thor.',
    ],
    tags: ['VLMs', 'Agents', 'Video RAG', 'Knowledge graphs', 'vLLM', 'Jetson Thor'],
  },
  {
    role: 'Founder', org: 'CopCars.in', orgUrl: 'https://copcars.in', kind: 'founder',
    period: 'Jun 2026 — Present', startYear: 2026, endYear: null, current: true,
    location: 'Bengaluru',
    blurb: 'A diecast collectibles store I founded and built end to end, with my vibe-coding shenanigans pushed straight to production. It takes real money.',
    wins: ['Storefront, catalog, inventory, accounts, admin, Razorpay checkout and a public catalog API, all on Cloudflare Workers, D1 and R2.'],
    tags: ['Commerce', 'Cloudflare Workers', 'D1', 'R2'],
  },
  {
    role: 'Z by HP Global Data Science Ambassador', org: 'HP', kind: 'ambassador',
    period: 'Oct 2023 — Oct 2025', startYear: 2023, endYear: 2025,
    location: 'San Francisco Bay Area · hybrid',
    blurb: 'AI evangelism for HP’s Z workstations: on the GTC 2025 stage, two demos at the GTC 2024 booth, and a Himalayan laptop running on GPUs in India.',
    wins: [
      'Spoke at NVIDIA GTC 2025 in HP’s session on building and deploying LLM applications on-premise.',
      'Two projects at the Z by HP booth, GTC 2024: Z Agent (local LLM + RAG) and an LLM that drives NanoOWL open-vocabulary detection.',
      'Featured in HP’s Boost webinar: remote GPUs in India powering my laptop in the Himalayas while I built Veronica.',
      'Z by HP Ambassador of the Month, Nov 2024.',
    ],
    tags: ['Evangelism', 'GTC', 'Local LLMs', 'Z by HP Boost'],
  },
  {
    role: 'Senior Software Developer (freelance)', org: 'Sentics', kind: 'freelance',
    period: 'Nov 2024 — Mar 2025', startYear: 2024, endYear: 2025,
    location: 'Wolfsburg, Germany · remote',
    blurb: 'Real-time sensor fusion in C++ and CUDA: multi-camera localisation and UWB merged into one live facility map at 30,000+ data points per second.',
    wins: ['Objects that crowd together across overlapping camera views keep a single identity on the map.'],
    tags: ['C++', 'CUDA', 'Sensor fusion', 'UWB'],
  },
  {
    role: 'Lead AI Architect', org: 'Avathon (formerly SparkCognition)', kind: 'role',
    period: 'May 2022 — Nov 2024', startYear: 2022, endYear: 2024,
    location: 'Bengaluru',
    blurb: 'Refined IRIS into the Visual AI Advisor (VAIA), then single-handedly turned VAIA into an SDK that cross-compiles between dGPU servers and NVIDIA Jetson.',
    wins: [
      'Invented a low-resource face recognition pipeline.',
      'Built cross-camera person re-identification for multi-camera sites.',
      'Led Visual AI R&D and demoed VAIA to customers to help close deals.',
    ],
    tags: ['Computer vision', 'DeepStream', 'TensorRT', 'Re-ID', 'SDKs'],
  },
  {
    role: 'Research Scholar', org: 'UC Berkeley', kind: 'research',
    period: 'Mar 2023 — Mar 2024', startYear: 2023, endYear: 2024,
    location: 'Berkeley, California',
    blurb: 'Early wildfire detection on ~1,000 Caltrans CCTV cameras: a state-of-the-art fire and smoke detector and a high-throughput Apache Beam pipeline to run it across every stream.',
    wins: [],
    tags: ['Research', 'Wildfire', 'Apache Beam', 'Object detection'],
  },
  {
    role: 'NVIDIA Jetson AI Ambassador', org: 'NVIDIA', kind: 'ambassador',
    period: 'Apr 2021 — Apr 2025', startYear: 2021, endYear: 2025,
    location: 'India · remote',
    blurb: 'Coached 100+ students through hands-on workshops on building and deploying AI on Jetson, and published open-source TensorRT and DeepStream projects.',
    wins: [],
    tags: ['Jetson', 'Workshops', 'TensorRT', 'DeepStream'],
  },
  {
    role: 'AI Architect', org: 'Integration Wizards Solutions', kind: 'role',
    period: 'Jul 2020 — May 2022', startYear: 2020, endYear: 2022,
    location: 'Bengaluru',
    blurb: 'Built IRIS, the flagship video analytics platform, natively on NVIDIA DeepStream with custom TensorRT kernels. Time-to-deploy down 75%. Scaled to 25+ enterprise customers and thousands of sites. Then SparkCognition bought the company.',
    wins: [
      'Face recognition and ANPR for Anonymisation.ai: real-time face and number-plate anonymisation for video.',
      'IRIS tuned for Jetson with FP16/INT8 quantisation.',
      'Stayed through the acquisition by SparkCognition (Mar 2022).',
    ],
    tags: ['DeepStream', 'TensorRT', 'CUDA', 'Video analytics'],
  },
  {
    role: 'IoT & ML Engineer', org: 'Integration Wizards Solutions', kind: 'role',
    period: 'Oct 2018 — Jul 2020', startYear: 2018, endYear: 2020,
    location: 'Bengaluru',
    blurb: 'Drones dispatched on an event, with video analytics on their feed. I led the hardest part: autonomous take-off and landing. Employee of the Year 2019.',
    wins: [
      'Trained and shipped YOLOv3, CenterNet and ResNet detectors, including a fire detector.',
      'Kafka pipeline for high-throughput multi-GPU inference, accelerated with TensorRT.',
    ],
    tags: ['Drones', 'YOLO', 'Kafka', 'TensorRT'],
  },
  {
    role: 'Product Developer (intern)', org: 'iB Hubs', kind: 'intern',
    period: 'Jun 2017 — Aug 2017', startYear: 2017, endYear: 2017,
    location: 'Bengaluru',
    blurb: 'An SDK for the Octabrix board, examples for the ESP8266, and a satellite modem (RockBLOCK 9603) on the bench.',
    wins: [],
    tags: ['IoT', 'SDKs', 'Satellite'],
  },
]

// The day job, product by product. Professional work, so no repos.
export const BLUE_STACK = [
  {
    name: 'Hyper Memory', kind: 'Semantic video memory',
    line: 'Photographic memory for CCTV. No context window required.',
    facts: [
      'Reads footage once into structured memory and a knowledge graph that builds itself',
      'Its own DSL: the same facts in 55% fewer tokens than JSON',
      'Reads only the frames worth reading: 73% fewer model calls',
      'No class list. Nobody planned for pink bottles; you can still ask for every pink bottle',
      'Every fact points to the exact clip and second it came from',
    ],
  },
  {
    name: 'BLUE Agent', kind: 'Agentic AI over every camera',
    line: 'One agent, every camera, every site, every recording, one chat box.',
    facts: [
      'Four ways in: Signals, Memories, Moments, Deep Scan',
      'Generative UI and generative dashboards: nobody built that dashboard, your questions did',
      'Every number verified against source data. Deep Scan never guesses',
    ],
  },
  {
    name: 'Helyx', kind: 'Prompt evolution for VLMs',
    line: 'Detection prompts that evolve themselves from a task description and labelled footage.',
    facts: ['Runs on Mendel-James, a gene-based evolution algorithm Akash designed'],
  },
  {
    name: 'BLUE Copilot', kind: 'Onboarding agent',
    line: 'An API-first LLM agent with tool calling that onboards cameras and configures detections inside each customer’s dashboard.',
    facts: [],
  },
  {
    name: 'BLUE Mini Edge', kind: 'Real-time edge analytics',
    line: 'Detection, multi-object tracking and VLM verification at the edge, with drones as live cameras.',
    facts: ['PPE, fire and smoke, dock safety, harness, forklift and footfall'],
  },
  {
    name: 'Inference & MLOps', kind: 'GPU serving',
    line: 'vLLM behind an LLM gateway, with per-hardware recipes from RTX Pro 6000, A100 and L40S down to NVIDIA Jetson Thor.',
    facts: [],
  },
]

// Curated, in display order. `repo` is the public source (null when the repo
// is private: never link or quote it). `href` overrides where the card links.
// `images[0]` is the cover. `facts` are measured, from each project's README.
export const PROJECTS = [
  {
    slug: 'noir', name: 'Noir Rover', featured: true,
    kicker: 'Agentic robotics', year: 2026, license: 'GPL-3.0',
    repo: 'https://github.com/kingardor/noir-rover',
    desc: 'A local AI agent that drives a palm-sized Moorebot Scout rover: it sees, remembers what it found and where, keeps a diary with camera-frame citations, follows you and patrols. One small model on a Mac. No cloud.',
    pitch: 'A rover that keeps a diary about you. With citations.',
    story: 'Noir hears, sees, drives and remembers on one small model, Liquid’s lfm3-omni through Ollama, running on a Mac. Every request fans out into four planner calls in parallel (wheels, skill, tools, mood), then one line is written after the fact and checked: numbers, names and sightings must come from a tool, the camera or memory, so he can’t claim what he didn’t do. Stop latches. Forward is blocked inside 30 cm. He writes a nightly Casebook with numbered links to the frames each sentence came from, runs missions (Follow, Patrol, Sentry, Detective, Hide and seek) and greets people he knows.',
    status: 'v2 rebuild, proven in the simulator; real-robot day pending',
    facts: [
      { k: 'Offline tests passing', v: '883' },
      { k: 'Simulator behaviour trials', v: '486 / 555' },
      { k: '“What do you see?” → “A mug is in front of me.”', v: '4.15 s' },
      { k: 'Models doing ears, eyes, brain and voice', v: '1' },
    ],
    stack: ['lfm3-omni', 'Ollama', 'embeddinggemma', 'FastAPI', 'ROS Noetic bridge', 'SQLite memory'],
    tags: ['Robotics', 'Agents', 'Local LLM', 'Memory'],
    images: [
      { src: '/work/noir/rover.webp', w: 960, h: 1280, kind: 'photo', alt: 'Noir, a palm-sized black rover, held in a tattooed hand in front of a laptop and a game controller' },
      { src: '/work/noir/drive.webp', w: 1600, h: 1000, kind: 'ui', alt: 'Drive view: the rover camera with detected objects labelled, the conversation with Noir on the right and a red Stop button' },
      { src: '/work/noir/casefile.webp', w: 1600, h: 1000, kind: 'ui', alt: 'Case file: a board of sightings joined by links such as “behind” and “seen with”' },
      { src: '/work/noir/casebook.webp', w: 1600, h: 1000, kind: 'ui', alt: 'Casebook: tonight’s diary entry with numbered citations to camera frames and a timeline' },
      { src: '/work/noir/missions.webp', w: 1600, h: 1000, kind: 'ui', alt: 'Missions: Follow, Patrol, Look around, Sentry, Detective and Hide and seek, with a patrol map' },
      { src: '/work/noir/people.webp', w: 1600, h: 1000, kind: 'ui', alt: 'People: who Noir knows, with match scores and recent sightings' },
      { src: '/work/noir/lab.webp', w: 1600, h: 1000, kind: 'ui', alt: 'Lab: where each turn’s time went, raw model output, sensors and the eval scorecard' },
      { src: '/work/noir/phone-drive.webp', w: 1600, h: 739, kind: 'ui', alt: 'Phone held sideways: full-screen camera with a thumbstick under each thumb' },
    ],
  },
  {
    slug: 'vector', name: 'Vector Desk AI', featured: true,
    kicker: 'Robotics · local LLM', year: 2026, license: 'Unlicense',
    repo: 'https://github.com/kingardor/vector-desk-ai',
    desc: 'A local brain for Anki’s Vector robot: one 2B model is his ears, brain and voice. He drives, dances, looks, sets timers, remembers you and roasts you. No cloud.',
    pitch: 'A palm-sized robot with a 98% behaviour score and a 100% attitude problem.',
    story: 'Three narrow planners run in parallel at temperature zero against JSON schemas that Ollama enforces: body, tools, face. One line is written knowing everything that actually happened, then guards catch invented times, broken character and promises a desk robot can’t keep (“I’ll brew it for you”). The first eval run scored 78%. Every failure became a fix in the harness, not the prompt.',
    status: 'Runs on the real robot through WirePod, or a simulated desk',
    facts: [
      { k: 'Behaviour score, 118 scenarios × 3 trials', v: '98.0%' },
      { k: 'Chat turn p50 on an M5 Pro', v: '0.67 s' },
      { k: 'Wake words caught / false wakes', v: '48/48 · 0' },
      { k: 'Noisy-audio word error', v: '24% → 3%' },
    ],
    quote: { line: 'You’re just a tool. I’ll keep it that way.', by: 'Vector, to a rude user' },
    stack: ['lfm3-omni', 'Ollama', 'Silero VAD', 'FastAPI', 'WirePod'],
    tags: ['Robotics', 'Local LLM', 'Voice', 'Evals'],
    images: [
      { src: '/work/vector/vector.webp', w: 1200, h: 751, kind: 'photo', alt: 'Anki Vector sitting in the palm of a hand' },
      { src: '/work/vector/talk.webp', w: 1600, h: 1000, kind: 'ui', alt: 'Talk view: Vector’s magenta eyes and his answer, “Five minutes. I’ll brew it for you.”' },
      { src: '/work/vector/conversation.webp', w: 1600, h: 1000, kind: 'ui', alt: 'An unedited session: angry red eyes and “You’re just a tool. I’ll keep it that way.”' },
      { src: '/work/vector/lab.webp', w: 1600, h: 1000, kind: 'ui', alt: 'Lab: turn list, latency waterfall, every model call and the picture the model saw' },
    ],
  },
  {
    slug: 'veronica', name: 'Veronica', featured: true, private: true,
    kicker: 'Personal AI · fully local', year: 2026,
    repo: null, href: '#/chat',
    desc: 'A fully local multimodal assistant that lives on one Mac: she hears and sees you, remembers what you tell her, runs a team of agents in the background and speaks first when something is worth saying. Her web twin answers questions on this site.',
    pitch: 'Tony had J.A.R.V.I.S. I built my own. She has a team.',
    story: 'Veronica started in 2021 on NVIDIA NeMo and DeepStream (Jasper, BERT, HiFi-GAN, CenterNet, YOLOv4), learned to fly drones and mark objects on a HUD, and won Z by HP Ambassador of the Month in Nov 2024. Today she runs entirely local: a 4B model for her turns, a 2B triage model, an embedder, an event log, her own voice and a seven-agent team (DUMMY, EDITH, SENTRY, FRIDAY, HOMER, JOCASTA, JARVIS) that keeps working while you don’t.',
    status: 'Private build. Her web twin is one click away',
    facts: [
      { k: 'Agents on her team', v: '7' },
      { k: 'Cloud calls', v: '0' },
      { k: 'Talking since', v: '2021' },
      { k: 'Z by HP Ambassador of the Month', v: 'Nov 2024' },
    ],
    stack: ['Ollama', 'Postgres event log', 'Local TTS', 'Electron', 'Next.js HUD'],
    tags: ['Assistant', 'Agents', 'Voice', 'Memory'],
    images: [
      { src: '/work/veronica/hud.webp', w: 1280, h: 820, kind: 'ui', alt: 'Veronica’s Voice screen: her team on the left, her holographic portrait in the centre, decisions waiting on the right' },
      { src: '/work/veronica/agents.webp', w: 1440, h: 900, kind: 'ui', alt: 'Her team: seven agents with their state and a timeline of their work' },
      { src: '/work/veronica/calm.webp', w: 1440, h: 900, kind: 'ui', alt: 'Veronica idle: a dim particle orb waiting to be spoken to' },
    ],
  },
  {
    slug: 'hermes', name: 'Hermes', featured: true,
    kicker: 'Wildfire detection · edge AI', year: 2020, license: null,
    repo: 'https://github.com/kingardor/Hermes-Deepstream',
    desc: 'Wildfire detection from a drone: a Ryze Tello streams to an NVIDIA Jetson Xavier NX running DeepStream and YOLO, with a live ops console and a flight mode that steers toward the fire.',
    pitch: 'A palm-sized drone and a Jetson that find the fire before the fire finds you.',
    story: 'The DeepStream app tracks every fire with a DCF tracker and publishes detections to Redis; MediaMTX turns the output into sub-second WebRTC. The console runs a video wall, fire events (New → Active → Intermittent → Ended), a detection timeline and device health. Flight mode works out the rotation that centres the biggest fire from the Tello’s 83° field of view. Emergency stop jumps the queue. Lose every operator for 10 seconds and the drone lands itself.',
    status: 'Most-starred repo. New web UI in 2026',
    facts: [
      { k: 'GitHub stars · forks', v: '67 · 27' },
      { k: 'Browser video latency', v: '< 1 s' },
      { k: 'Auto-land with no operator', v: '10 s' },
      { k: 'Towards Data Science feature', v: 'Dec 2020' },
    ],
    stack: ['Jetson Xavier NX', 'DeepStream', 'YOLOv3', 'Redis', 'MediaMTX', 'FastAPI'],
    tags: ['Jetson', 'DeepStream', 'Drones', 'YOLO'],
    images: [
      { src: '/work/hermes/console.webp', w: 1600, h: 1000, kind: 'ui', alt: 'Hermes live ops console: four camera feeds with fire detections, fire events and a detection timeline' },
      { src: '/work/hermes/flight.webp', w: 1600, h: 1000, kind: 'ui', alt: 'Flight mode: the drone feed with fire boxes, telemetry and an emergency stop' },
      { src: '/work/hermes/rig.webp', w: 1200, h: 900, kind: 'photo', alt: 'A Ryze Tello drone and an NVIDIA Jetson Xavier NX side by side on a wooden bench' },
    ],
  },
  {
    slug: 'q-pocket', name: 'Q-Pocket-AI', featured: true,
    kicker: 'Edge AI · Arduino UNO Q', year: 2026, license: 'Unlicense',
    repo: 'https://github.com/kingardor/Q-Pocket-AI',
    desc: 'Pocket-sized vision AI that runs entirely on an Arduino UNO Q: chat with a local vision-language model, detect objects and watch the board’s LED matrix react. No cloud.',
    pitch: 'A vision-language model on a pocket-sized board. On the CPU, because it has no NPU.',
    story: 'The UNO Q pairs a Qualcomm QRB2210 (four Cortex-A53 cores running Debian) with an STM32U585 microcontroller. Qwen3.5 0.8B runs on the A53s through ollama; YOLOE-26n, exported to NCNN FP16 at 416 px, finds objects in about 180 ms. The browser mirrors the board’s 8×13 LED matrix live: a twinkle on boot, bursts while thinking, a radar sweep while detecting, a checkmark when done.',
    status: 'Runs on the board; screenshots from the mock board',
    facts: [
      { k: 'Open-world detection on a Cortex-A53', v: '~180 ms' },
      { k: 'On-device VLM', v: 'Qwen3.5 0.8B' },
      { k: 'LED matrix, mirrored live', v: '8 × 13' },
      { k: 'Bytes sent to the cloud', v: '0' },
    ],
    stack: ['Arduino UNO Q', 'ollama', 'YOLOE-26n', 'NCNN', 'STM32'],
    tags: ['Edge AI', 'VLM', 'Arduino', 'Hardware'],
    images: [
      { src: '/work/q-pocket/board.webp', w: 1440, h: 960, kind: 'photo', alt: 'Akash holding up an Arduino UNO Q with its blue LED matrix lit' },
      { src: '/work/q-pocket/detect.webp', w: 1600, h: 1000, kind: 'ui', alt: 'Detect tab: a photo with labelled boxes for a person, a phone and a cup' },
      { src: '/work/q-pocket/chat.webp', w: 1600, h: 1000, kind: 'ui', alt: 'Chat with a photo, beside the device rail with the board orb and the LED-matrix twin' },
    ],
  },
  {
    slug: 'copcars', name: 'CopCars.in', featured: true, private: true,
    kicker: 'Commerce · founder', year: 2026,
    repo: null, href: 'https://copcars.in',
    desc: 'A diecast collectibles store I founded and built end to end: storefront, catalog, inventory, accounts, admin tools, Razorpay checkout and a public catalog API, on Cloudflare Workers, D1 and R2.',
    pitch: 'I vibe-coded a store straight into production. It takes real money.',
    story: 'One person, one edge network: a Next.js storefront on Cloudflare Workers, D1 for the catalog, inventory and orders, R2 for every photo, Razorpay for payments, and a public catalog API for anyone who wants the data. Built for collectors who refresh at midnight.',
    status: 'Live',
    facts: [
      { k: 'Status', v: 'Live, taking orders' },
      { k: 'Built by', v: '1 person' },
      { k: 'Runs on', v: 'Workers · D1 · R2' },
      { k: 'Payments', v: 'Razorpay' },
    ],
    stack: ['Next.js', 'Cloudflare Workers', 'D1', 'R2', 'Razorpay'],
    tags: ['Commerce', 'Edge', 'Founder'],
    images: [
      { src: '/work/copcars/garage.webp', w: 1600, h: 917, kind: 'art', alt: 'Neon CopCars sign over a garage at night, with diecast supercars on wet asphalt' },
      { src: '/work/copcars/tray.webp', w: 1200, h: 800, kind: 'art', alt: 'A wooden collector’s tray of diecast cars under pink neon light' },
    ],
  },
  {
    slug: 'zassistant', name: 'Z Assistant',
    kicker: 'RAG · Z by HP', year: 2024, license: 'Apache-2.0',
    repo: 'https://github.com/kingardor/zassistant',
    desc: 'A conversational guide to Z by HP workstations: a local Llama 3.1 8B answers from HP’s product PDFs with page citations, running on a GPU borrowed over the network through Z by HP Boost. Shown at NVIDIA GTC 2024.',
    pitch: 'Tell it what you create; it tells you which workstation to buy, with the page number. On a borrowed GPU.',
    story: 'Answers come only from the Z by HP documents and every one shows the document and page it drew on. A startup screen follows each step of borrowing an idle GPU from a Z workstation on the network; a status pill shows whether you’re Boosted and how much session is left. One click scores the conversation with Galileo.',
    status: 'Demoed at the Z by HP booth, GTC 2024',
    facts: [
      { k: 'Model', v: 'Llama 3.1 8B, local' },
      { k: 'Citations', v: 'Document + page' },
      { k: 'GPU', v: 'Borrowed via Boost' },
      { k: 'Stage', v: 'GTC 2024 booth' },
    ],
    stack: ['Ollama', 'LangChain', 'Chroma', 'Flask', 'Redis', 'Z by HP Boost'],
    tags: ['RAG', 'LLM', 'Z by HP'],
    images: [
      { src: '/work/zassistant/home.webp', w: 1600, h: 1000, kind: 'ui', alt: 'Z Assistant home: “Find the right Z workstation, in a conversation.”' },
      { src: '/work/zassistant/chat.webp', w: 1600, h: 1000, kind: 'ui', alt: 'A streamed answer with Boost GPU timing and source pages' },
      { src: '/work/zassistant/boot.webp', w: 1600, h: 1000, kind: 'ui', alt: 'Boost startup: each step of connecting to a remote GPU, with timings' },
      { src: '/work/zassistant/boost.webp', w: 1600, h: 1000, kind: 'ui', alt: 'Boost details: remote GPU, model, knowledge base and session time left' },
    ],
  },
  {
    slug: 'shred', name: 'ShredFPSOpponents',
    kicker: 'Computer vision · gaming', year: 2019, license: 'MIT',
    repo: 'https://github.com/kingardor/ShredFPSOpponents',
    desc: 'Real-time enemy detection for first-person shooters: screen capture, YOLOv3, a box on every opponent. Works with any game, because it only reads pixels.',
    pitch: 'Aimbot energy, ethics intact. It only draws the boxes.',
    story: 'A light client grabs part of the screen, letterboxes it to 416 × 416 and posts it to a Flask/Gunicorn server that owns a frozen YOLOv3 graph. COCO’s “person” is relabelled Enemy, and only enemies get drawn. No hooks, no mods, no memory reading.',
    status: 'A 2019 classic, README rebuilt in 2026',
    facts: [
      { k: 'Game hooks needed', v: '0' },
      { k: 'Model input', v: '416 × 416' },
      { k: 'Better Programming feature', v: 'Aug 2019' },
    ],
    stack: ['YOLOv3', 'TensorFlow', 'Flask', 'Gunicorn', 'mss'],
    tags: ['Gaming', 'YOLO', 'Computer vision'],
    images: [
      { src: '/work/shred/detection.webp', w: 1400, h: 788, kind: 'ui', alt: 'Unreal Tournament on the left; the same frame on the right with a box around the enemy' },
    ],
  },
]

// Older public work. Stars as of Nov 2026.
export const ARCHIVE = [
  { name: 'Activity Recognition — TensorRT', year: 2021, stars: 48, repo: 'https://github.com/kingardor/Activity-Recognition-TensorRT', desc: '3D-ResNet video classification at FP16 with TensorRT. The demo stars headbanging and a cat.' },
  { name: 'YOLOv4 — DeepStream', year: 2021, stars: 38, repo: 'https://github.com/kingardor/YOLOv4-Deepstream', desc: 'YOLOv4 with TensorRT and multi-stream DeepStream input. The video says 1,500 FPS on RTX.' },
  { name: 'YOLOv4 — OpenCV CUDA DNN', year: 2021, stars: 37, repo: 'https://github.com/kingardor/YOLOv4-OpenCV-CUDA-DNN', desc: 'YOLOv4 straight through OpenCV’s CUDA DNN backend. Written up in Towards Data Science.' },
  { name: 'YOLOv8 — DeepStream 6.1', year: 2023, stars: 21, repo: 'https://github.com/kingardor/yolov8-deepstream-6-1', desc: 'Ultralytics YOLOv8 running in DeepStream 6.1.' },
  { name: 'RetinaFace — ONNX', year: 2023, stars: 12, repo: 'https://github.com/kingardor/retinaface-onnx', desc: 'RetinaFace exported to ONNX, with inference.' },
  { name: 'CenterFace — DeepStream', year: 2021, stars: 10, repo: 'https://github.com/kingardor/Centerface-Deepstream', desc: 'CenterFace ONNX on DeepStream 5.1 with custom output parsers.' },
  { name: 'Vector + Advanced AI', year: 2023, stars: 9, repo: 'https://github.com/kingardor/vector-advanced-ai', desc: 'The first Vector brain: Llama 2 with Ultron’s personality and Whisper for ears.' },
  { name: 'Oculus', year: 2018, stars: null, repo: null, desc: 'A smart glove with a camera for the visually impaired: objects, faces, Indian currency, OCR. Published in IJARCS.' },
  { name: 'GloveBud', year: 2016, stars: null, repo: null, desc: 'Gesture-controlled home automation from flex sensors, an accelerometer and a NodeMCU.' },
  { name: 'GARB-e', year: 2018, stars: null, repo: null, desc: 'Smart bins that report their fill level, shortest-path pickups and a bot that sorts waste.' },
  { name: 'Zuko', year: 2019, stars: null, repo: null, desc: 'Crowd-sourced fire reports plus drones that detect fire and plan rescue paths.' },
]

export const SKILLS = {
  radar: [
    { domain: 'Computer vision', score: 97 },
    { domain: 'Video AI & VLMs', score: 95 },
    { domain: 'AI agents', score: 93 },
    { domain: 'Edge AI', score: 93 },
    { domain: 'GPU inference', score: 90 },
    { domain: 'Selling it', score: 88 },
  ],
  techBars: [
    { tech: 'Python', years: 8, level: 'Expert' },
    { tech: 'PyTorch', years: 7, level: 'Expert' },
    { tech: 'TensorRT', years: 7, level: 'Expert' },
    { tech: 'DeepStream', years: 6, level: 'Expert' },
    { tech: 'CUDA', years: 6, level: 'Expert' },
    { tech: 'C++', years: 6, level: 'Expert' },
    { tech: 'NVIDIA Jetson', years: 6, level: 'Expert' },
    { tech: 'LLM agents', years: 3, level: 'Advanced' },
    { tech: 'VLMs', years: 2, level: 'Advanced' },
    { tech: 'vLLM', years: 2, level: 'Advanced' },
  ],
  groups: [
    { name: 'Vision & video', items: ['DeepStream', 'TensorRT', 'YOLO / YOLOE', 'Re-ID & tracking', 'OpenCV', 'ONNX', 'NCNN', 'Apache Beam'] },
    { name: 'VLMs & agents', items: ['VLMs', 'Agent harnesses', 'Agent memory', 'Tool calling', 'RAG', 'Knowledge graphs', 'vLLM', 'Ollama', 'CrewAI'] },
    { name: 'Edge & robots', items: ['Jetson Nano → Thor', 'Arduino UNO Q', 'ROS', 'Drones', 'Sensor fusion', 'Anki Vector', 'Moorebot Scout'] },
    { name: 'Systems', items: ['CUDA', 'C++', 'Python', 'FastAPI', 'Redis', 'Postgres', 'Qdrant', 'Kafka', 'WebRTC', 'Cloudflare Workers'] },
  ],
}

// Newest first. `pub` is where it ran.
export const WRITING = [
  { title: 'Simplifying Data Science Workflows: an overview of Z by HP Data Science Stack Manager', url: 'https://akash-james.medium.com/simplifying-data-science-workflows-an-overview-of-z-by-hp-data-science-stack-manager-5084d681bf48', platform: 'Medium', pub: 'Medium', date: '2024-02-12' },
  { title: 'How an AI organisation can make a difference during the pandemic', url: 'https://akash-james.medium.com/how-an-ai-organisation-can-make-a-difference-during-the-pandemic-db63ee396df9', platform: 'Medium', pub: 'Medium', date: '2021-06-04' },
  { title: 'What it takes to be an Artificial Intelligence Architect', url: 'https://akash-james.medium.com/what-it-takes-to-be-an-artificial-intelligence-architect-ed7757c504fb', platform: 'Medium', pub: 'Medium', date: '2021-05-17' },
  { title: 'Train models like a pro with NVIDIA TLT 3.0', url: 'https://akash-james.medium.com/train-models-like-a-pro-with-nvidia-tlt-3-0-54ea20467661', platform: 'Medium', pub: 'Medium', date: '2021-03-03' },
  { title: 'YOLOv4 with CUDA-powered OpenCV DNN', url: 'https://medium.com/data-science/yolov4-with-cuda-powered-opencv-dnn-2fef48ea3984', platform: 'Medium', pub: 'Towards Data Science', date: '2021-02-25' },
  { title: 'Hermes — Wildfire detection using NVIDIA Jetson and Ryze Tello', url: 'https://medium.com/data-science/hermes-wildfire-detection-using-nvidia-jetson-and-ryze-tello-8da123f05c64', platform: 'Medium', pub: 'Towards Data Science', date: '2020-12-31' },
  { title: 'So I heard you can do computer vision at 30 FPS; I can do 1000', url: 'https://akash-james.medium.com/so-i-heard-you-can-do-computer-vision-at-30fps-i-can-do-1000-a4ee72505fc3', platform: 'Medium', pub: 'Becoming Human', date: '2020-08-18' },
  { title: 'Shred your first-person-shooter opponents with AI', url: 'https://medium.com/better-programming/shred-your-first-person-shooter-opponents-with-ai-390b60046997', platform: 'Medium', pub: 'Better Programming', date: '2019-08-23' },
  { title: 'What it takes to be a Deep Learning Engineer', url: 'https://becominghuman.ai/what-it-takes-to-be-a-deep-learning-engineer-805103806148', platform: 'Medium', pub: 'Becoming Human', date: '2019-05-17' },
  { title: 'Computer Vision: a step closer to Skynet', url: 'https://akash-james.medium.com/computer-vision-a-step-closer-to-skynet-9a3692eee243', platform: 'Medium', pub: 'Medium', date: '2019-02-25' },
  { title: 'Oculus: a smart wearable for the visually impaired', url: null, platform: 'Paper', pub: 'IJARCS', date: '2018-05-31' },
]

// Stages, booths, workshops and panels. `video` is a YouTube watch URL.
export const TALKS = [
  { title: 'Aura8 panel: The Convergence of Intelligent Capital and Autonomous AI Systems', where: 'LinkedIn Live · Cryptonite UAE', date: '2026-06-09', kind: 'panel' },
  { title: 'Augmented reality with Unity and agentic coding (workshop)', where: 'MIT ADT University', date: '2026-06', kind: 'workshop' },
  { title: 'BLUE: a semantic video data lake for the real world', where: 'India AI Impact Summit 2026', date: '2026-02', kind: 'exhibit' },
  { title: 'Supercharge Gen AI Development with Z by HP GenAI Lab and AI Studio', where: 'NVIDIA GTC 2025 · HP session', date: '2025-03', kind: 'stage' },
  { title: 'Two live demos: Z Agent, and an LLM driving NanoOWL', where: 'NVIDIA GTC 2024 · Z by HP booth', date: '2024-03', kind: 'demo' },
  { title: 'Remote GPUs in India, a laptop in the Himalayas', where: 'Z by HP Boost webinar', date: null, kind: 'webinar' },
  { title: 'The Cool Data Projects Show, Ep. 1: How Akash James approaches computer vision', where: 'Comet', video: 'https://www.youtube.com/watch?v=1VQXLXshKNY', kind: 'show' },
  { title: 'Build high-FPS object detection pipelines with NVIDIA DeepStream and Triton', where: 'TFUG Coimbatore · AI Tamilnadu', video: 'https://www.youtube.com/watch?v=J0fhEByPzVQ', kind: 'talk' },
  { title: 'DeepStream on Jetson (webinar)', where: 'Netzwerk Academy', date: '2021-09-26', kind: 'webinar' },
  { title: '100+ students through hands-on Jetson workshops', where: 'NVIDIA Jetson AI Ambassador', date: '2021–2025', kind: 'workshop' },
]

// Deliberately no patent entry (owner's decision, Nov 2026).
export const HONOURS = [
  { key: 'GTC', title: 'NVIDIA GTC 2025 speaker; two demos at GTC 2024', year: 2025, issuer: 'NVIDIA GTC', url: null },
  { key: 'Z BY HP', title: 'Z by HP Ambassador of the Month, Nov 2024, for Veronica', year: 2024, issuer: 'Z by HP', url: null },
  { key: 'NASA', title: 'NASA Space Apps Challenge winner, Bengaluru 2020', year: 2020, issuer: 'NASA Space Apps', url: null },
  { key: 'NASA', title: 'NASA Space Apps Challenge winner, South Nodal Zone 2019', year: 2019, issuer: 'NASA Space Apps', url: null },
  { key: 'NVIDIA', title: 'NVIDIA Jetson AI Ambassador and Jetson AI Specialist', year: 2021, issuer: 'NVIDIA', url: null },
  { key: 'EOY', title: 'Employee of the Year 2019, and Rising Star', year: 2019, issuer: 'Integration Wizards', url: null },
  { key: 'SIH', title: 'Top 10, Smart India Hackathon 2018', year: 2018, issuer: 'Smart India Hackathon', url: null },
  { key: 'PAPER', title: 'Best Paper, REVA Technical Conference ’18', year: 2018, issuer: 'REVA University', url: null },
]

export const EDUCATION = [
  { school: 'UC Berkeley', what: 'Research Scholar, Artificial Intelligence', years: '2023 — 2024' },
  { school: 'REVA University', what: 'BE, Computer Science', years: '2014 — 2018', note: 'Founded GLUG REVA, the campus Linux user group. Best Cultural Performer, 2018.' },
]

// The human bits, for layouts that want them.
export const OFF_DUTY = [
  'Beatboxes',
  'Collects diecast cars (and sells them)',
  'Drives robots with a PS5 controller',
  'Names his agents after Stark’s AIs',
  'Has a cat that appears in his demos',
]

// Fallback list; the live feed comes from /api/youtube-feed.
export const VIDEOS = [
  'https://www.youtube.com/watch?v=1VQXLXshKNY',
  'https://www.youtube.com/watch?v=J0fhEByPzVQ',
]

// Hero stat line. Sourced from LinkedIn (Nov 2026); "50+ models shipped" is Akash's own figure.
export const STATS = [
  { num: '8+', label: 'Years shipping vision AI', sub: 'Production, not notebooks' },
  { num: '50+', label: 'Models shipped', sub: 'Prod-grade, not demos' },
  { num: '3', label: 'Video AI platforms', sub: 'IRIS · VAIA · BLUE' },
  { num: '1', label: 'Acquisition', sub: 'Integration Wizards → SparkCognition' },
  { num: '100+', label: 'Students coached', sub: 'NVIDIA Jetson workshops' },
  { num: '2×', label: 'NASA Space Apps', sub: '2019 · 2020' },
]

// More receipts, for layouts with room to brag.
export const BRAGS = [
  { num: '50+', label: 'Models shipped to production' },
  { num: '~1,000', label: 'Caltrans cameras watched for wildfire' },
  { num: '25+', label: 'Enterprise customers on IRIS' },
  { num: '−75%', label: 'Time-to-deploy on IRIS' },
  { num: '30,000+', label: 'Data points fused per second' },
  { num: '100+', label: 'Students coached on Jetson' },
  { num: '1,500', label: 'FPS out of YOLOv4 on DeepStream' },
  { num: '98.0%', label: 'Vector’s behaviour score' },
  { num: '883', label: 'Offline tests behind Noir' },
  { num: '73%', label: 'Fewer model calls in Hyper Memory' },
]

export const MANIFESTO = [
  { txt: 'Cameras record everything' },
  { txt: 'and remember nothing.' },
  { txt: 'I’m fixing that.', accent: true },
  { txt: 'Eight years' },
  { txt: 'teaching machines to see:' },
  { txt: 'on Jetsons, on drones,' },
  { txt: 'on a thousand Caltrans cameras,' },
  { txt: 'on the GTC stage.' },
  { txt: 'Now they remember,' },
  { txt: 'they reason,' },
  { txt: 'they talk back.', accent: true },
]

export const SKILLS_SENTENCE =
  'The tool is a detail. The outcome isn’t. I take vision models from a notebook to a thousand cameras, quantised onto Jetsons, wrapped in agents that verify their own numbers. Three video AI platforms. One acquisition. Now Director AI at BLUE, teaching CCTV to remember.'

export const KEY_WORDS = ['Jetsons', 'remember', 'GTC', 'BLUE']

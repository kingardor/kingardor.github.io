import { BadgeCheck, Brain, Camera, Cpu, FileCode2, ShieldCheck, WandSparkles } from 'lucide-react'

export const LINKS = {
  linkedin: 'https://linkedin.com/in/akashjames',
  medium: 'https://akash-james.medium.com',
  github: 'https://kingardor.github.io',
  twitter: 'https://twitter.com/king_ardor',
  instagram: 'https://instagram.com/lifeofakashjames',
  email: 'mailto:akashjamesofficial@gmail.com'
}

export const NOW_ROLES = [
  {
    title: 'Founding AI Architect',
    org: 'Stealth Startup',
    period: 'Mar 2025 — Present',
    blurb: 'Building a video data lake with full agentic capabilities (multimodal RAG, LLM tools, graph-native retrieval).',
    tags: ['GenAI','Agentic','Video','RAG','Qdrant']
  },
]

export const PAST_ROLES = [
  {
    title: 'Lead AI Architect',
    org: 'SparkCognition',
    period: 'Aug 2022 — 2025',
    blurb: 'Roadmapped and led SC’s Visual AI Advisor (VAIA). Patented a low‑resource face recognition pipeline; built cross‑cam re‑ID; shipped SDKs.',
    tags: ['Computer Vision','DeepStream','TensorRT','Product']
  },
  {
    title: 'Visiting Research Scholar (Former)',
    org: 'UC Berkeley',
    period: '2023',
    blurb: 'Wildfire detection research: low‑latency pipeline across ~1k CalTrans CCTVs; YOLO‑based smoke/fire detection.',
    tags: ['Research','CV','Edge AI']
  },
  {
    title: 'AI Architect',
    org: 'Integration Wizards',
    period: '2020 — 2022',
    blurb: 'Designed high‑FPS video analytics on GPUs (DeepStream), modular IRIS pipeline (−75% time‑to‑deploy).',
    tags: ['CUDA','Pipelines','Analytics']
  },
]

export const BADGES = [
  { icon: <WandSparkles className="h-4 w-4"/>, label: 'Generative AI Builder' },
  { icon: <ShieldCheck className="h-4 w-4"/>, label: 'Z by HP Global Data Science Ambassador' },
  { icon: <Cpu className="h-4 w-4"/>, label: 'NVIDIA Jetson AI Ambassador' },
  { icon: <BadgeCheck className="h-4 w-4"/>, label: 'Jetson AI Research Lab Member' },
]

export const SKILLS = [
  { icon: <Brain className="h-4 w-4"/>, name: 'Generative AI', items: ['qLoRA','SFT','DPO','Prompt/Routing','Agents'] },
  { icon: <Camera className="h-4 w-4"/>, name: 'Multimodal', items: ['Vision‑Language','Video QA','Re‑ID','Tracking'] },
  { icon: <FileCode2 className="h-4 w-4"/>, name: 'RAG / Retrieval', items: ['Hybrid sparse+dense','GraphRAG','Qdrant','Re‑rank','Dedup/Cluster'] },
  { icon: <Cpu className="h-4 w-4"/>, name: 'Acceleration', items: ['DeepStream','TensorRT','CUDA','Triton'] },
]

export const PROJECTS = [
  { name: 'Hermes — Wildfire Detection (DeepStream)', url: 'https://github.com/kingardor/Hermes-Deepstream', desc: 'Drone‑assisted wildfire detection on Jetson Xavier NX using DeepStream + YOLO; RTSP bridge for Tello.', tags: ['Jetson','DeepStream','YOLO'] },
  { name: 'Activity Recognition — TensorRT', url: 'https://github.com/kingardor/Activity-Recognition-TensorRT', desc: '3D‑ResNet video classification optimized with TensorRT for real‑time action recognition.', tags: ['TensorRT','Video','3D‑CNN'] },
  { name: 'YOLOv4 — OpenCV CUDA DNN', url: 'https://github.com/kingardor/YOLOv4-OpenCV-CUDA-DNN', desc: 'Run YOLOv4 directly in OpenCV’s CUDA DNN for fast CV inference.', tags: ['OpenCV','CUDA'] },
  { name: 'CenterFace — DeepStream', url: 'https://github.com/kingardor/Centerface-Deepstream', desc: 'CenterFace (ONNX) accelerated on DeepStream 5.1 with custom parsers.', tags: ['Face','ONNX','DeepStream'] },
  { name: 'Vector + Advanced AI', url: 'https://github.com/kingardor/vector-advanced-ai', desc: 'Hacking Anki Vector with advanced AI capabilities. Because why not.', tags: ['Robotics','LLM'] },
  { name: 'Shred FPS Opponents', url: 'https://github.com/kingardor/ShredFPSOpponents', desc: 'Pipe game frames → YOLOv3 → detect opponents.', tags: ['Gaming','YOLO'] },
]

export const HONOURS = [
  { title: 'Patent: Face Image Matching based on Feature Comparison', url: 'https.www.ipqwery.com/ipowner/en/owner/ip/1255518-sparkcognition-inc.html?rgk=IPType&rgk=Jurisdiction&rvk=Patent&rvk=WIPO' },
  { title: 'Ambassador of the Month — Z by HP', url: 'https.community.datascience.hp.com/community-spotlight-55/ambassador-of-the-month-akash-james-232' },
]

export const TITLES = [
  'Founding AI Architect — Stealth (Agentic Video Data Lake)',
  'Generative AI • qLoRA • SFT • DPO',
  'Multimodal RAG • Qdrant • GraphRAG',
  'Edge/Video AI • DeepStream • TensorRT'
]

export const YT_VIDEOS = [
  'https://www.youtube.com/watch?v=1VQXLXshKNY',
  'https://www.youtube.com/watch?v=J0fhEByPzVQ',
]

export const SECTION_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#highlights', label: 'Highlights' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#videos', label: 'Videos' },
  { href: '#writing', label: 'Writing' },
  { href: '#honours', label: 'Honours' },
  { href: '#contact', label: 'Contact' },
]

export const MEDIUM_POSTS = [
  { title: 'Blaze through your setup with Z by HP Data Science Stack Manager', url: 'https://akash-james.medium.com/simplifying-data-science-workflows-an-overview-of-z-by-hp-data-science-stack-manager-5084d681bf48' },
  { title: 'What it takes to be an Artificial Intelligence Architect', url: 'https://akash-james.medium.com/what-it-takes-to-be-an-artificial-intelligence-architect-ed7757c504fb' },
  { title: 'What it takes to be a Deep Learning Engineer', url: 'https://akash-james.medium.com/what-it-takes-to-be-a-deep-learning-engineer-805103806148' },
  { title: 'Train models like a pro with NVIDIA TLT 3.0', url: 'https://akash-james.medium.com/train-models-like-a-pro-with-nvidia-tlt-3-0-54ea20467661' },
  { title: 'YOLOv4 with CUDA-powered OpenCV DNN', url: 'https://akash-james.medium.com/yolov4-with-cuda-powered-opencv-dnn-2fef48ea3984' },
  { title: 'How an AI organisation can make a difference during the pandemic', url: 'https://akash-james.medium.com/how-an-ai-organisation-can-make-a-difference-during-the-pandemic-db63ee396df9' },
  { title: 'Computer Vision: A Step Closer to Skynet', url: 'https://akash-james.medium.com/computer-vision-a-step-closer-to-skynet-9a3692eee243' }
]

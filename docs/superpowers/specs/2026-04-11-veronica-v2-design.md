# Veronica v2 — Tool-Calling Agent with Rich Chat Rendering

**Date:** 2026-04-11  
**Repos:** `kingardor.github.io` (frontend) · `veronica-proxy-vercel` (backend)  
**Status:** Approved — ready for implementation

---

## 1. Overview

Veronica is the AI assistant on Akash James's portfolio. This upgrade does three things:

1. **Model swap** — Google Gemini (gemma-3-27b-it) → OpenRouter Qwen3-6B, preserving SSE streaming.
2. **Agent upgrade** — Replace the 93-line prose system prompt with 7 structured tool calls, giving the model on-demand access to all portfolio data with a lean persona-only system prompt.
3. **Rich chat rendering** — Frontend handles typed SSE events to render video carousels, project grids, skill radar, career timeline, and tech bar charts inline in the chat.

---

## 2. Backend Changes (`veronica-proxy-vercel`)

### 2.1 Model Swap

| Before | After |
|--------|-------|
| `google-genai` SDK | `requests` (already a dep) via OpenRouter HTTP |
| `gemma-3-27b-it` | `qwen/qwen3-6b` |
| `GEMINI_API_KEY` env var | `OPENROUTER_API_KEY` env var |

OpenRouter endpoint: `https://openrouter.ai/api/v1/chat/completions`  
Protocol: OpenAI-compatible, supports tool calling + SSE streaming.

`requirements.txt` changes: remove `google-genai`, no new deps needed (requests already present).

### 2.2 System Prompt (slim)

The 93-line prose prompt is replaced by a lean persona + behavior spec only. All factual data is removed and served via tools. The new prompt covers:

- Identity: Veronica, British, sassy, slightly Ultron-tinged, built for Akash James
- Tone: brief, wit, no emojis, UK spelling
- Scope steering rules (same as before)
- Single follow-up rule
- Superuser mode (`/admin kn1ght`)
- Instruction: **use tools whenever asked about Akash's work, skills, career, projects, videos, publications, or honours — don't answer from memory**
- Instruction: **for detail questions, use markdown with tables and structure; for quick questions, be brief**

### 2.3 Tool Definitions (7 tools)

All tools except `get_youtube_videos` are pure Python dict lookups — no I/O, sub-millisecond.

```python
TOOLS = [
    get_bio()              # → BIO dict: name, tagline, current/past summary, contact links
    get_career_timeline()  # → list of {company, role, period, start_year, end_year, blurb, tags}
    get_projects()         # → list of {name, url, desc, tags}
    get_skills()           # → {domain: score} for radar + {tech: {years, level}} for bars
    get_youtube_videos()   # → calls internal /api/youtube-feed, returns items list
    get_publications()     # → list of {title, url, platform}
    get_honours()          # → list of {title, url}
]
```

Tool schemas use standard OpenAI function calling format (`{"type": "function", "function": {...}}`). No parameters needed for any tool — they return Akash's full data for that domain.

### 2.4 Portfolio Data (Python dicts in `index.py`)

Sourced from `src/data.js` and the existing system prompt:

```python
BIO = {
    "name": "Akash James",
    "tagline": "Generative AI Architect · Open-source builder · Tech influencer",
    "current_role": "Director of AI at MyBlue.ai (Mar 2025–present)",
    "current_focus": "Video-first data lake with agentic multimodal RAG and graph-native retrieval",
    "highlights": ["3 AI platforms built 0→1", "50+ production use-cases", "10+ multimodal platforms", "1 product acquisition"],
    "affiliations": ["Z by HP Global Data Science Ambassador", "NVIDIA Jetson AI Research Lab"],
    "contact": {
        "email": "akashjamesofficial@gmail.com",
        "github": "https://github.com/kingardor",
        "instagram": "https://instagram.com/lifeofakashjames",
        "twitter": "https://twitter.com/king_ardor",
        "medium": "https://akash-james.medium.com"
    }
}

CAREER = [
    {"company": "MyBlue.ai", "role": "Director of AI", "period": "Mar 2025 — Present",
     "start_year": 2025, "end_year": 2026,
     "blurb": "Building a video data lake with agentic capabilities (multimodal RAG, LLM tools, graph-native retrieval).",
     "tags": ["GenAI", "Agentic", "Video", "RAG", "Qdrant"]},
    {"company": "SparkCognition", "role": "Lead AI Architect", "period": "Aug 2022 — 2025",
     "start_year": 2022, "end_year": 2025,
     "blurb": "Led Visual AI Advisor (VAIA). Patented face recognition pipeline; built cross-cam re-ID; shipped SDKs.",
     "tags": ["Computer Vision", "DeepStream", "TensorRT", "Product"]},
    {"company": "UC Berkeley", "role": "Visiting Research Scholar", "period": "2023",
     "start_year": 2023, "end_year": 2024,
     "blurb": "Wildfire detection: low-latency pipeline across ~1k CalTrans CCTVs; YOLO-based smoke/fire detection.",
     "tags": ["Research", "CV", "Edge AI"]},
    {"company": "Integration Wizards", "role": "AI Architect", "period": "2020 — 2022",
     "start_year": 2020, "end_year": 2022,
     "blurb": "High-FPS video analytics on GPUs (DeepStream), modular IRIS pipeline (−75% time-to-deploy).",
     "tags": ["CUDA", "Pipelines", "Analytics"]},
]

PROJECTS = [
    {"name": "Hermes — Wildfire Detection (DeepStream)",
     "url": "https://github.com/kingardor/Hermes-Deepstream",
     "desc": "Drone-assisted wildfire detection on Jetson Xavier NX using DeepStream + YOLO; RTSP bridge for Tello.",
     "tags": ["Jetson", "DeepStream", "YOLO"]},
    {"name": "Activity Recognition — TensorRT",
     "url": "https://github.com/kingardor/Activity-Recognition-TensorRT",
     "desc": "3D-ResNet video classification optimized with TensorRT for real-time action recognition.",
     "tags": ["TensorRT", "Video", "3D-CNN"]},
    {"name": "YOLOv4 — OpenCV CUDA DNN",
     "url": "https://github.com/kingardor/YOLOv4-OpenCV-CUDA-DNN",
     "desc": "Run YOLOv4 directly in OpenCV's CUDA DNN for fast CV inference.",
     "tags": ["OpenCV", "CUDA"]},
    {"name": "CenterFace — DeepStream",
     "url": "https://github.com/kingardor/Centerface-Deepstream",
     "desc": "CenterFace (ONNX) accelerated on DeepStream 5.1 with custom parsers.",
     "tags": ["Face", "ONNX", "DeepStream"]},
    {"name": "Vector + Advanced AI",
     "url": "https://github.com/kingardor/vector-advanced-ai",
     "desc": "Hacking Anki Vector with advanced AI capabilities.",
     "tags": ["Robotics", "LLM"]},
    {"name": "Shred FPS Opponents",
     "url": "https://github.com/kingardor/ShredFPSOpponents",
     "desc": "Pipe game frames → YOLOv3 → detect opponents.",
     "tags": ["Gaming", "YOLO"]},
]

SKILLS = {
    "radar": {
        "GenAI": 95, "RAG/Retrieval": 92, "Architecture": 90,
        "Edge AI": 85, "MLOps": 80, "Infrastructure": 75
    },
    "tech_bars": [
        {"tech": "PyTorch", "years": 5, "level": "Expert"},
        {"tech": "TensorRT", "years": 4, "level": "Expert"},
        {"tech": "DeepStream", "years": 4, "level": "Expert"},
        {"tech": "CrewAI / Agents", "years": 3, "level": "Advanced"},
        {"tech": "Qdrant", "years": 3, "level": "Advanced"},
        {"tech": "FastAPI", "years": 4, "level": "Expert"},
        {"tech": "Docker / GPU", "years": 5, "level": "Expert"},
        {"tech": "LangChain", "years": 3, "level": "Advanced"},
        {"tech": "CUDA", "years": 5, "level": "Expert"},
        {"tech": "Kubernetes", "years": 2, "level": "Proficient"},
    ]
}

PUBLICATIONS = [
    {"title": "Blaze through your setup with Z by HP Data Science Stack Manager",
     "url": "https://akash-james.medium.com/simplifying-data-science-workflows-an-overview-of-z-by-hp-data-science-stack-manager-5084d681bf48",
     "platform": "Medium"},
    {"title": "What it takes to be an Artificial Intelligence Architect",
     "url": "https://akash-james.medium.com/what-it-takes-to-be-an-artificial-intelligence-architect-ed7757c504fb",
     "platform": "Medium"},
    {"title": "What it takes to be a Deep Learning Engineer",
     "url": "https://akash-james.medium.com/what-it-takes-to-be-a-deep-learning-engineer-805103806148",
     "platform": "Medium"},
    {"title": "Train models like a pro with NVIDIA TLT 3.0",
     "url": "https://akash-james.medium.com/train-models-like-a-pro-with-nvidia-tlt-3-0-54ea20467661",
     "platform": "Medium"},
    {"title": "YOLOv4 with CUDA-powered OpenCV DNN",
     "url": "https://akash-james.medium.com/yolov4-with-cuda-powered-opencv-dnn-2fef48ea3984",
     "platform": "Medium"},
    {"title": "How an AI organisation can make a difference during the pandemic",
     "url": "https://akash-james.medium.com/how-an-ai-organisation-can-make-a-difference-during-the-pandemic-db63ee396df9",
     "platform": "Medium"},
    {"title": "Computer Vision: A Step Closer to Skynet",
     "url": "https://akash-james.medium.com/computer-vision-a-step-closer-to-skynet-9a3692eee243",
     "platform": "Medium"},
]

HONOURS = [
    {"title": "Patent: Face Image Matching based on Feature Comparison",
     "url": "https://www.ipqwery.com/ipowner/en/owner/ip/1255518-sparkcognition-inc.html"},
    {"title": "Ambassador of the Month — Z by HP",
     "url": "https://community.datascience.hp.com/community-spotlight-55/ambassador-of-the-month-akash-james-232"},
]
```

### 2.5 Agentic Loop with SSE Streaming

The `/api/chat` handler is rewritten. It runs a synchronous agentic loop inside a generator function that yields SSE frames:

```
1. Build messages: [system] + history + user_message
2. POST to OpenRouter /chat/completions (stream=False for tool loop, stream=True for final text)
3. If finish_reason == "tool_calls":
   a. For each tool call:
      - yield SSE: {"t":"tool","name":"<name>","status":"running"}
      - execute tool function (sync)
      - yield SSE: {"t":"block","name":"<name>","data":<result>}
      - append assistant tool_call message + tool result message to messages
   b. Loop back to step 2
4. If finish_reason == "stop" (or no tool calls):
   - Re-request with stream=True (or use accumulated content)
   - yield thinking tokens as {"t":"thinking","v":"<chunk>"}
   - yield text chunks as {"t":"text","v":"<chunk>"}
5. yield {"t":"done"} then "[DONE]"
```

**Note on streaming + tool calls:** Tool-call resolution passes use **non-streaming** (`stream=False`) — we need the complete `tool_calls` JSON object before executing tools. Once all tools are resolved, the final text generation pass uses **streaming** (`stream=True`) for real-time token delivery. Max loop depth: 3 iterations (safety guard against infinite tool loops).

**Stateless:** No session state. All context (history + tool results) lives in the messages array for that request. Works fine on Vercel serverless.

### 2.6 New SSE Event Schema

All frames are JSON-encoded except the terminal `[DONE]` sentinel (kept for backwards compat):

```
data: {"t":"tool","name":"get_youtube_videos","status":"running"}\n\n
data: {"t":"block","name":"get_youtube_videos","data":[{...}]}\n\n
data: {"t":"thinking","v":"The user wants to see videos..."}\n\n
data: {"t":"text","v":"Here are Akash's latest videos:"}\n\n
data: [DONE]\n\n
```

The existing `_sse_frame()` helper is reused. Old plain-text chunks (non-JSON `data:` lines) are no longer emitted.

### 2.7 `vercel.json` — no changes needed

Existing routes cover all endpoints. No new routes required.

---

## 3. Frontend Changes (`kingardor.github.io`)

### 3.1 New Dependency

```bash
npm install recharts
```

`recharts` provides RadarChart, BarChart (horizontal Gantt + tech bars). Tree-shakeable. Dark theme support via CSS variable props.

### 3.2 `openSSE.js` — Protocol Upgrade

Current: accumulates raw text chunks, calls `onChunk(text)`.

New: parses each `data:` line as JSON (with fallback for `[DONE]`), dispatches typed events:

```js
onEvent({ t: 'text', v: string })        // append to message content
onEvent({ t: 'thinking', v: string })    // append to thinking buffer
onEvent({ t: 'tool', name, status })     // update tool status indicator
onEvent({ t: 'block', name, data })      // push to message.blocks[]
```

`onChunk` callback is **replaced** by `onEvent(event)`. No legacy callers — ChatPage is the only consumer.

### 3.3 `ChatPage.jsx` — Message Model + Streaming State

**Message shape** extended:

```js
{
  role: 'user' | 'model',
  content: string,          // markdown prose
  thinking: string,         // Qwen3 chain-of-thought (may be empty)
  blocks: [                 // rich UI blocks, rendered after prose
    { type: string, data: any }
  ]
}
```

**New streaming state:**
- `toolStatus: string | null` — shown in typing indicator while tool runs (e.g. `"SCANNING VIDEOS..."`)
- `thinkingBuffer: string` — accumulated thinking text for the in-progress message

**`prepareHistory()`** — maps new message shape back to `{role, content}` pairs for the API (strips blocks/thinking, keeps prose only).

**Session storage** — serializes the extended message shape; blocks are preserved across refresh.

### 3.4 Typing Indicator — Tool Status

When `t === 'tool'` event arrives, `toolStatus` is set to a human-friendly label:

| Tool name | Label |
|-----------|-------|
| `get_youtube_videos` | `SCANNING VIDEOS...` |
| `get_projects` | `LOADING PROJECTS...` |
| `get_skills` | `READING SKILL MAP...` |
| `get_career_timeline` | `FETCHING TIMELINE...` |
| `get_bio` | `PULLING BIO...` |
| `get_publications` | `FINDING ARTICLES...` |
| `get_honours` | `CHECKING HONOURS...` |

The existing `TypingIndicator` component shows this label instead of `COMPUTING`.

### 3.5 Thinking Block — Collapsible

A new `ThinkingBlock.jsx` component renders above the prose in AI messages:

- Collapsed by default, toggle to expand
- Header: dim pulse dot + `VERONICA IS THINKING` label + `▾` / `▴` chevron
- Expanded: monospace dim text, scrollable if long
- Only shown when `message.thinking` is non-empty

### 3.6 `ChatBlocks.jsx` — Block Router

New component rendered below each AI message's prose:

```jsx
function ChatBlocks({ blocks }) {
  return blocks.map(block => {
    switch (block.type) {
      case 'get_youtube_videos':   return <VideoCarousel data={block.data} />
      case 'get_projects':         return <ProjectGrid data={block.data} />
      case 'get_skills':           return <SkillCharts data={block.data} />
      case 'get_career_timeline':  return <CareerTimeline data={block.data} />
      case 'get_publications':     return <PublicationList data={block.data} />
      case 'get_honours':          return <HonoursList data={block.data} />
    }
  })
}
```

### 3.7 New Visual Components

All components in `src/sections/Chat/blocks/`:

#### `VideoCarousel.jsx`
- Horizontal scrollable row of video cards
- Each card: thumbnail image (from `thumb` URL) + title + relative date + play icon overlay
- Clicking opens YouTube URL in new tab
- Max 9 items (matches backend `YT_MAX`)
- Theme-aware: nm-card dark/light borders

#### `ProjectGrid.jsx`
- 2-column grid (1-col on mobile)
- Each card: project name + tag pills + description + GitHub link icon
- Tags rendered as `nm-pill` chips matching existing design system

#### `SkillCharts.jsx`
- Two charts stacked vertically with section headers
- **Top:** `SkillRadar` — Recharts `RadarChart` with `Radar` + `PolarGrid`, domains as subjects, scores as values. Accent color fill (`--nm-accent`).
- **Bottom:** `TechBars` — Recharts `BarChart` layout="vertical", years on X axis, tech names on Y. Gradient fill accent→accent-2.

#### `CareerTimeline.jsx`
- Recharts `BarChart` layout="vertical" (Gantt-style)
- X axis: years (2020–2026)
- Y axis: company names
- Each bar: start_year → end_year, color-coded by recency
- Tooltip shows role + blurb on hover

#### `PublicationList.jsx`
- Simple list of article links with platform badge (Medium, etc.)
- External link icon, opens in new tab

#### `HonoursList.jsx`
- Simple list with award icon, external links

### 3.8 Recharts Theming

All charts read CSS variables for colors:

```jsx
const accent = getComputedStyle(document.documentElement)
  .getPropertyValue('--nm-accent').trim()  // #dc2626
const accent2 = getComputedStyle(document.documentElement)
  .getPropertyValue('--nm-accent-2').trim() // #db2777
const surface = getComputedStyle(document.documentElement)
  .getPropertyValue('--nm-surface').trim()
const textMuted = getComputedStyle(document.documentElement)
  .getPropertyValue('--nm-text-muted').trim()
```

Charts re-read these on theme change (via `useTheme()` hook from existing context).

---

## 4. File Change Summary

### Backend (`veronica-proxy-vercel`)

| File | Change |
|------|--------|
| `api/index.py` | Full rewrite of chat handler + new data dicts + tool definitions + agentic loop |
| `requirements.txt` | Remove `google-genai` |

### Frontend (`kingardor.github.io`)

| File | Change |
|------|--------|
| `package.json` | Add `recharts` |
| `src/shared/utils/openSSE.js` | Parse typed JSON events, dispatch via `onEvent` |
| `src/sections/Chat/ChatPage.jsx` | Extended message model, tool status, thinking buffer, render blocks |
| `src/sections/Chat/blocks/ChatBlocks.jsx` | **New** — block router |
| `src/sections/Chat/blocks/VideoCarousel.jsx` | **New** |
| `src/sections/Chat/blocks/ProjectGrid.jsx` | **New** |
| `src/sections/Chat/blocks/SkillCharts.jsx` | **New** (radar + tech bars) |
| `src/sections/Chat/blocks/CareerTimeline.jsx` | **New** |
| `src/sections/Chat/blocks/PublicationList.jsx` | **New** |
| `src/sections/Chat/blocks/HonoursList.jsx` | **New** |
| `src/sections/Chat/components/ThinkingBlock.jsx` | **New** |

---

## 5. Out of Scope

- No changes to portfolio sections (Hero, About, Skills, etc.)
- No changes to BgFX, ChatBackground, or theme system
- No persistent backend storage
- No auth or rate limiting changes
- No changes to YouTube feed endpoint logic

---

## 6. Open Questions (resolved)

- **Model ID:** `qwen/qwen3-6b` — user-specified; key stored as `OPENROUTER_API_KEY` in Vercel env vars
- **Tool parameters:** None required — all tools return full domain data; model filters in prose
- **Backwards compat:** `[DONE]` sentinel kept; old `data: plain text` format dropped entirely (no old clients to support)
- **Thinking tokens:** OpenRouter exposes Qwen3 thinking as `choices[0].message.reasoning_content` (non-streaming) or `choices[0].delta.reasoning_content` (streaming). The backend streams these as `{"t":"thinking","v":"<chunk>"}` events. If the field is absent (model didn't think), no thinking events are emitted and `ThinkingBlock` stays hidden.

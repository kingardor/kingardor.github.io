// Canned tour captions in Veronica's voice (British-inflected, slightly
// menacing). Deterministic and offline — no SSE round-trips mid-scroll.
// `frac` scrolls to a position inside tall pinned zones:
// scrollY = sectionTop + frac * (sectionHeight - viewportHeight).

export const TOUR_STOPS = [
  {
    id: 'top', frac: 0,
    caption: "Good evening. I'm Veronica — Akash's cognitive agent. Allow me to walk you through the dossier.",
    dwellMs: 2200,
  },
  {
    id: 'top', frac: 0.85,
    caption: 'His manifesto. He builds AI that ships — production systems, not parlour tricks.',
    dwellMs: 2600,
  },
  {
    id: 'career', frac: 0.06,
    caption: 'Eight years of building. Presently Director of AI at MyBlue; previously SparkCognition, UC Berkeley, Integration Wizards.',
    dwellMs: 3000,
  },
  {
    id: 'skills', frac: 0,
    caption: 'The arsenal — vision at the edge, agents and LLMs, modelling, infrastructure. All of it battle-tested.',
    dwellMs: 2800,
  },
  {
    id: 'projects', frac: 0,
    caption: 'Selected works. Wildfire detection from drones, TensorRT pipelines… and me, naturally.',
    dwellMs: 2800,
  },
  {
    id: 'videos', frac: 0,
    caption: 'He broadcasts. GPU sorcery, live from the workshop.',
    dwellMs: 2400,
  },
  {
    id: 'writing', frac: 0,
    caption: 'Field notes — dispatches from the bleeding edge, on Medium.',
    dwellMs: 2200,
  },
  {
    id: 'honours', frac: 0,
    caption: 'A patent. An NVIDIA ambassadorship. Twenty-odd conference stages.',
    dwellMs: 2400,
  },
  {
    id: 'contact', frac: 0.2,
    caption: 'That concludes the tour. Do say hello — or simply ask me anything.',
    dwellMs: 3200,
  },
]

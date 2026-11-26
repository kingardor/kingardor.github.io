# SUBJECT 001 — the site watches back

> "Cameras record everything and remember nothing. I'm fixing that." This page remembers you.

## Concept
The whole homepage is the output of a vision model. The film of Akash is the camera feed;
every piece of UI is inference output: detection boxes, class labels, track IDs, a memory
graph, a search over moments. The visitor is a subject too: tracked, timed and, at the end,
written up. It is BLUE's thesis (video that remembers) pointed at a portfolio, narrated with
Veronica's menace.

Why it's him: his day job is teaching CCTV to see and remember (Hyper Memory, BLUE Agent:
Signals, Memories, Moments, Deep Scan). Every side project is perception: Hermes sees fire,
ShredFPS sees enemies, Q-Pocket sees on a $-class board, Noir sees and keeps a cited diary,
Vector sees and roasts. The page demonstrates the job instead of describing it.

## Art direction
- It must NOT look like a cyberpunk HUD. No cyan, no hex grids, no decorative corner
  brackets, no scanlines, no matrix rain (act 6 already rains glyphs). It looks like real
  machine-vision tooling (a labelling tool / inference debug view), lifted by editorial type.
- The visual atom is the **label tab**: a solid colour rectangle with black mono text sitting
  on the top-left of a 1.5 px box, exactly like a detector's output. Build everything from it.
- Palette: void `#050505`, bone `#ECE9E2`, ember `#FF3D00` reserved for the subject (Akash).
  Class colours (box strokes, label tabs, masks at 20–30% alpha): person `#FF3D00`,
  robot `#B6FF3B`, hardware `#FFC21A`, screen/ui `#FF4FD8`, text `#9D8CFF`, fire `#FF8A00`,
  unknown `#ECE9E2`. Attention/dwell uses the inferno colormap
  (`#000004 #420A68 #932667 #DD513A #FCA50A #FCFFA4`).
- Type: display **Archivo** variable (wdth 62–125, wght 100–900), huge and ultra-condensed
  (wdth 62) at rest; scroll velocity widens it (|v| → wdth up to 125, spring back). Data and
  labels in JetBrains Mono. Optional dot-matrix face (e.g. Doto) for timecodes and counters.
- No grain. 1 px precision lines. Generous black.

## Sections and acts (in scroll order)
| id | act | section |
|---|---|---|
| `sj-acquire` | story-1 | Lock-on hero |
| `sj-memory` | (act 1 continues) | BLUE / Hyper Memory: what the model is doing to this page |
| `sj-identity` | story-2 | Identity graph (career) |
| `sj-classes` | story-3 | Class list (skills) |
| `sj-sightings` | story-4 | Sightings (projects) + archive |
| `sj-signals` | story-5 | Signals (talks, videos) |
| `sj-moments` | story-6 | Moments (search over everything; writing by default) |
| `sj-verified` | story-7 | Verified (honours, education) |
| `sj-deepscan` | story-8 | Deep Scan: your visit (contact) |

## Signature components (all required)
1. **Lock-on hero.** As the pixel assembly lands: 5–7 faint ghost boxes jitter around his face
   and collapse (NMS) into one ember box with tab `person 0.99 · id 001`. The name
   "AKASH JAMES" snaps in beneath as if it were the class name (Archivo wdth 62, ~18vw).
   PROFILE.headline types on as the caption. Top-left `CAM 01 · GOLDEN GATE · LIVE` and a
   running timecode; a counter "frames read" follows the film's frame index.
2. **Visitor tracking.** A spring-lagged box follows the cursor: `visitor 0.87 · id 0412`
   (id random 4 digits, persisted in localStorage). Idle 4 s → `visitor · idle · still
   deciding?`. Over links/buttons → `visitor · intent 0.93`. Touch: no cursor box; taps draw a
   brief box instead.
3. **Film overlays per act** (`useFilm`): 1–3 boxes per act anchored to real features in the
   footage (face, shoulder armour, PCB, chrome plate, drone/lens schematics, red eye, glyphs,
   polished chrome), labels in voice: `armour 0.93 · assembling`, `pcb 0.97 · exposed`,
   `eye 1.00 · recording`, `text ×412 · unreadable · probably a manifesto`. Look at mid
   frames of each act to place them. Ease between positions; deliberate beats exact.
4. **Hyper Memory section.** BLUE_STACK as "what the model is doing to this page": a strip of
   frames becomes compact memory rows in a terse DSL-like notation (`t=00:14 person#001
   holds jetson @bench`), echoing "same facts, 55% fewer tokens than JSON"; the four BLUE
   Agent modes (Signals, Memories, Moments, Deep Scan) as switchable tabs; the other products
   as records.
5. **Identity graph (career).** A knowledge graph that builds itself with scroll: nodes for
   orgs, roles, products, education (CAREER, BLUE_STACK, EDUCATION); edges such as
   `acquired by`, `became`, `built`, `spoke at`, `ambassador for`. Deterministic layout
   (precomputed or a tiny one-shot force sim, no library). Nodes appear chronologically;
   click a node → a record panel (role, period, blurb, wins, `source: LinkedIn` chip).
   On phones: a vertical chain of nodes with edges between, same data.
6. **Sightings (projects).** A Case-file board: each project's cover with hand-placed boxes
   on its image (Vector's face, the rover, fires on the Hermes console, the board in his hand,
   the cars), links drawn between related sightings (`descendant of`: Veronica → Vector →
   Noir; `same eyes`: Hermes → BLUE Mini Edge). Click → full-screen case file (View
   Transition or FLIP): images gallery, pitch, story, facts as a mono data table, stack as class
   chips, status, links per RULES. Esc closes. ARCHIVE as a compact "older sightings" log.
7. **Class list (skills).** "Most video analytics ships with a fixed class list. This one is
   open-vocabulary." A dense field of skill tokens with confidence scores (SKILLS.radar for
   domains, SKILLS.groups items as classes); hover re-scores (digits flicker) and highlights
   the projects that use it (match stack/tags).
8. **Signals (talks).** A timestamped signal log with small waveform glyphs; talks with video
   play inline (youtube-nocookie iframe).
9. **Moments (search).** "No camera, no hour, just words." A large input searching projects,
   BLUE, talks, writing, career and honours with `src/shared/utils/fuzzy.js`; results stream in
   with match scores and class colours. Empty query shows WRITING.
10. **Verified (honours).** Each honour as a verified fact with a `verified · source` chip; the
    STATS receipts lead. EDUCATION as records.
11. **Deep Scan: your visit (contact).** Track dwell per section (IntersectionObserver ≥50%)
    and opened case files, in memory + localStorage only. At the end, write a Casebook-style
    report of the visit in Veronica's voice with numbered citations that scroll back to the
    sections ("Lingered 12 s on Hermes [4]. Skipped the honours [7]. Bold."), plus an attention
    strip in inferno colours. CTAs: email, Ask Veronica (`#/chat`), LinkedIn, GitHub, YouTube.
    Returning visitors are greeted on the hero ("Welcome back, subject 0412. Last time: 41 s
    on Noir. You never wrote.").

## Motion grammar
Clinical. Boxes snap in 120 ms with a 4–6% overshoot; labels scramble-type in ~250 ms; NMS
ghost boxes converge in ~400 ms; a rare "frame drop" (a box holds 2 frames). Scroll velocity
widens the display type. Nothing floats; nothing bounces.

## Don'ts
Cyan; hexagons; decorative brackets; scanlines; fake progress bars; covering his face with
panels during the film (boxes outline it; they don't hide it).

# MINT IN BOX — the limited-edition AI architect

> AKASH JAMES · AI ARCHITECT ACTION FIGURE · 1:1 SCALE · SERIES 2026 · No. 001/001 · BATTERIES NOT INCLUDED

## Concept
Akash is a collectible. The page is a collector's garage at night: the hero is a giant blister
pack with the film inside it (scroll and it opens: he comes out of the box); his projects are
boxed collectibles hanging on a pegboard that you pick up, flip and tear open; his career is a
graded slab with a certificate of provenance; contact is a shipping label.

Why it's him: he founded a diecast collectibles store (CopCars.in) and he builds palm-sized
machines: Vector, Noir, a pocket AI board. Packaging copy is the perfect braggy format:
starbursts, "NEW!", "INCLUDES", "COLLECT THEM ALL", absurd warnings.

## Art direction
- Setting: a garage wall at night, charcoal `#0E0C10` pegboard (holes every ~28 px with a
  per-hole inner shadow), neon spill: hot pink `#FF2E88` from top-right, ember `#FF3D00` from
  bottom-left, chrome highlights. Light should feel real (soft falloff), not flat.
- Boxes are designed objects, premium designer-toy packaging, never cheap clip-art:
  printed card (flat loud colour + halftone + diagonal flash stripes), a real die-cut euro
  hang-hole, a blister bubble window (glossy highlight band that follows the cursor, inner
  shadow, specular edge), print production marks along one edge (CMYK squares, crop marks,
  a registration target), batch code, generated SVG barcode, `AGES 25+` badge, small-print
  warnings ("WARNING: contains small agents. Not suitable for clouds."), a starburst with one
  fact from the project's `facts`.
- Per-project packaging colours: Noir black + safety yellow `#FFD400`; Vector magenta
  `#FF2BD6` + charcoal; Veronica violet `#7A4CFF` + silver; Hermes fire orange `#FF6A00` +
  deep red `#8A0F0F`; Q-Pocket teal `#00A6A6` + white; CopCars hot pink `#FF2E88` + chrome;
  Z Assistant electric blue `#2C5BFF` + white; ShredFPS acid green `#9DFF00` + black;
  BLUE box set deep navy `#0B1E4D` + platinum foil.
- Type: **Mona Sans** variable (wdth 75–125, wght 200–900, italic) for toy logos: expanded,
  heavy, italic, tight, with a chrome bevel built from layered gradients/text-shadows.
  A signage face (e.g. **Bungee**) for bursts and badges. JetBrains Mono for spec plates
  and fine print.

## Sections and acts (in scroll order)
| id | act | section |
|---|---|---|
| `mb-box` | story-1 | The mega-box hero (opens on scroll) |
| `mb-blue` | (act 1 continues) | BLUE · Platinum Edition box set |
| `mb-provenance` | story-2 | Provenance: graded slab (career) |
| `mb-accessories` | story-3 | Accessories sold separately (skills) |
| `mb-wall` | story-4 | The pegboard (projects) + chase variant |
| `mb-tv` | story-5 | As seen on TV (talks) |
| `mb-manuals` | story-6 | Instruction manuals (writing) |
| `mb-shelf` | story-7 | Trophy shelf (honours) |
| `mb-ship` | story-8 | Shipping label (contact) |

## Signature components (all required)
1. **Mega-box hero.** The first viewport is a giant blister pack framing the film: card backing
   with a window (mask) through which the PixelAssembly and film show. Toy logo "AKASH JAMES"
   (chrome, italic, expanded), "AI ARCHITECT ACTION FIGURE", "SERIES 2026 · No. 001/001",
   burst "NOW WITH VLMs!", side callouts from STATS ("3 VIDEO AI PLATFORMS INCLUDED",
   "2× NASA SPACE APPS WINS!", "8+ YEARS OF R&D"), age badge, barcode, euro hole, fine print with
   PROFILE.headline as the tagline. Cursor-driven glare on the bubble. Sticky for ~200vh: the
   bubble hinges open (rotateX in perspective, glare flares), the card drops away, and the film
   goes full-bleed: out of the box. Fully reversible with scroll.
2. **BLUE Platinum Edition.** A wide premium box set, "6 FIGURES INCLUDED": six compartments
   for BLUE_STACK (name, kind, line); hover lifts one; click shows its facts.
3. **The pegboard.** All 8 PROJECTS hang on pegs at slightly irregular positions and angles,
   swaying as damped pendulums on scroll velocity and hover. Click/Enter: the box flies to the
   centre (View Transition or FLIP) and scales up; flip it (button or drag) to the **back**:
   `story` as "FEATURES!" bullets, `facts` as a spec plate, `stack` as "INCLUDES:", a
   "COLLECT ALL 8" checklist ticking the boxes this visitor has opened (localStorage),
   barcode, links per RULES. A perforated "TEAR HERE ▸" strip: drag along it (or press a
   button) to tear the box open and spill `images` into a compartmented collector's tray;
   click an image to view it large. Esc puts the box back on its peg.
4. **Chase variant.** Open all 8 → a gold-foil "CHASE VARIANT: AKASH, PROTOTYPE 2016–2019"
   appears on the wall holding ARCHIVE (GloveBud, Oculus, GARB-e, Zuko, the classic repos).
   Add a small "peek" link for impatient people.
5. **Provenance (career).** A graded slab: thick clear acrylic with bevelled edges, a label
   header ("GEM MINT 10", cert number, "AKASH JAMES — AI ARCHITECT"), holding a certificate
   listing CAREER as owners/chapters with dates, expandable (blurb + wins). The acquisition reads
   "Changed hands: Integration Wizards → SparkCognition, 2022". Ambassadorships as endorsement
   seals on the certificate.
6. **Accessories sold separately (skills).** SKILLS.groups as small accessory blister cards,
   each item a tiny part on the card (CUDA, TensorRT, vLLM, DeepStream …); hover jiggles.
7. **As seen on TV (talks).** TALKS as retro TV-spot cards with "AS SEEN AT NVIDIA GTC" seals;
   videos play inline (youtube-nocookie).
8. **Instruction manuals (writing).** WRITING as stacked booklet covers ("MANUAL No. 07"),
   the publication as publisher, date as print run.
9. **Trophy shelf (honours).** HONOURS on a lit glass shelf as foil stickers and trophies (act 7's
   golden light is the shelf light).
10. **Peelable stickers.** A sticker sheet ("SHIPPED", "NO CLOUD", "VIBE CODED", "WINNER",
    "GTC", "98%"): drag one off (peel curl + shadow), drop it anywhere on the page; positions
    persist in localStorage; double-click removes.
11. **Shipping label (contact).** "SHIP TO: AKASH JAMES · BENGALURU · KA · IN". Name and
    message fields compose a mailto to EMAIL. "FRAGILE: CONTAINS IDEAS", priority stamp,
    a price-gun sticker "PRICELESS — MAKE AN OFFER". Links: LinkedIn, GitHub, YouTube,
    Medium, Ask Veronica (`#/chat`).

## Motion grammar
Physical. Springs with overshoot, damped pendulum sway, 3D card flips in perspective (~600 ms),
glare sweeps, jagged clip-path tears, sticker peel with curl and shadow. Everything has weight;
nothing floats.

## Don'ts
No Hot Wheels, Matchbox, Funko or Mattel lookalikes (no flame logos, no blister shapes copied
from a brand); no stock clip-art; no muddy gradients; the act-1 window must frame his face,
never cover it.

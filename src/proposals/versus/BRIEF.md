# VERSUS — player 1 has entered the portfolio

> PLAYER 1: AKASH JAMES · CLASS: AI ARCHITECT · STYLE: VISION + AGENTS · DIFFICULTY: UNFAIR

## Concept
The homepage is a fighting game's menu system. Akash is the playable fighter and the film is
his transformation super; his robots and products are the roster; his career is story mode;
his skills are a move list with frame data; honours are trophies; contact is the continue
screen. Fighting-game UI is bragging by design: stats, titles, taunts, ratings.

Why it's him: a gamer (drives robots with a PS5 controller, built an FPS-opponent detector,
put robots and an Xbox pad in the same video), his robots have real attitude (Vector's actual
roast lines), and his career has literal rounds and an acquisition finisher.

Originality: genre conventions only (character select, VS screen, meters, move list with
input notation, continue countdown). Copy no franchise's logos, characters, fonts, UI
layouts, sound or catchphrases.

## Art direction: a riso fight poster, in motion
- Ink black `#0A0A0A`, paper white `#F4F1EA`. Two fluorescent riso inks, fluoro pink
  `#FF48B0` and fluoro yellow `#F3FF4A`, plus ember `#FF3D00` for Player 1 and deep violet
  `#3B1E8C` as shadow ink. Misregistered overprints: headline duplicates offset 3–6 px in pink
  and yellow with blend modes. Halftone dot fields as shading and as transitions. Layout tilts
  on −12° diagonals; only data tables sit square.
- Type: **Big Shoulders Display** (variable; 900, ultra-condensed caps) for slams and names;
  a hand-painted face (e.g. **Permanent Marker**) for taunts, sparingly; JetBrains Mono for
  frame data, stats and timers.
- Shapes: chunky parallelogram plates, double outlines, speed lines, SVG impact bursts and
  ink splatters (drawn paths, not photos).

## Sections and acts (in scroll order)
| id | act | section |
|---|---|---|
| `vs-title` | story-1 | Title screen (hero) |
| `vs-story` | story-2 | Story mode (career) |
| `vs-final` | (act 2 continues) | Final round: BLUE and the ultimate moves |
| `vs-moves` | story-3 | Move list (skills) |
| `vs-select` | story-4 | Character select (projects) + VS screen |
| `vs-replays` | story-5 | Replay theatre (talks) |
| `vs-lore` | story-6 | Lore codex (writing) |
| `vs-trophies` | story-7 | Trophy room (honours) |
| `vs-continue` | story-8 | Continue? (contact) |

## Signature components (all required)
1. **Title screen.** The pixel assembly is "PLAYER 1 LOADING". When it lands the name slams in
   (scale 1.8 → 1, a one-frame white flash, a 6 px shake decaying over ~300 ms) in giant
   condensed caps with misregistered pink/yellow duplicates. Subtitle: "CLASS: AI ARCHITECT ·
   STYLE: VISION + AGENTS · DIFFICULTY: UNFAIR". Blinking "PRESS START" (any key, click or
   scroll starts: it scrolls to story mode). Corners: "CREDITS 00" counting clicks, "1P 2026".
   A health bar + super meter frame across the top; the super meter fills with page progress
   and is full at the contact screen.
2. **Combo meter.** Scroll velocity drives a hit counter in the margin ("12 HITS"), with rating
   words at thresholds ("NICE", "BRUTAL", "UNHINGED", "ARCHITECTURAL"); decays when idle.
   One rAF via scrollStore. Hidden under reduced motion.
3. **Story mode (career).** CAREER from earliest to latest as round cards ("ROUND 1 · 2017 ·
   iB HUBS"). Entering a round slams "ROUND N" and an original second word ("SHIP IT").
   Integration Wizards, 2022, gets an "ACQUIRED!" finisher splash. Ambassadorships (NVIDIA,
   HP) appear as ASSIST cameo cards. BLUE is the **FINAL ROUND**: BLUE_STACK as his ultimate
   moves (name, line, facts).
4. **Move list (skills).** A command list: each move is a skill with an input notation drawn
   in SVG (arrows + buttons) and "frame data" columns using real content numbers where they
   exist ("HYPER MEMORY · 73% fewer calls", "SENSOR FUSION · 30,000+/s", "DEEP SCAN · never
   guesses", "MENDEL-JAMES · gene-based"). Sources: SKILLS.groups, BLUE_STACK, BRAGS. Hover
   plays the input (arrows light in sequence).
5. **Character select (projects).** A roster of the 8 PROJECTS plus a locked "?" boss slot
   (BLUE) that unlocks after all 8 have been hovered, or on click. Portraits are crops of
   `images` (tune object-position per project). Hover/focus: the big portrait slides in with name,
   title (kicker), a 4-stat block derived honestly from `facts` ("TESTS 883", "STARS 67",
   "LATENCY 0.67 s") and a taunt bubble (`quote.line` or `pitch`). Click/Enter: **VS screen**:
   diagonal split, P1 Akash vs the project, "VS" crash with an impact burst and shake, then
   the stage (project detail): images as stage backgrounds, story, facts as frame data, stack,
   links per RULES. Esc returns to select.
6. **Super cut-ins synced to the film.** On each act change (`useFilmAct`) a diagonal cut-in
   strip flashes across (~700 ms) with that act's super: "CIRCUIT WAKE", "ARMOUR UP",
   "OPEN MIND", "CHROME PROTOCOL", "RED EYE", "GLYPH STORM", "MIRROR FINISH",
   "FINAL FORM". Translucent, fast, never over an open VS screen.
7. **Replay theatre (talks).** TALKS as replay files with a REC badge; inline youtube-nocookie
   playback; "BEST MOMENT" tags.
8. **Lore codex (writing).** WRITING as codex entries ("LORE #07"), publication and date.
9. **Trophy room (honours).** HONOURS as trophies with rarity tiers (GTC platinum;
   NASA ×2 gold; others silver/bronze), each "UNLOCKED" as it scrolls in, with a
   completion line ("TROPHIES 9/9 · 100%").
10. **Continue? (contact).** A countdown "CONTINUE? 9 … 8 …" that runs only while in view and
    ends on "GAME OVER? NEVER." (no reset). Buttons: "CHALLENGE HIM" (mailto EMAIL),
    "TALK TO THE BOSS" (`#/chat`), LinkedIn, GitHub, YouTube. "PLAYER 2: ENTER YOUR NAME" as
    a 3-letter arcade initials input that personalises the mailto subject.

## Motion grammar
Slams with overshoot, hit-stop (freeze 60–80 ms on impact), translate-only screen shake that
decays, one-frame flashes, diagonal wipes, halftone dissolves, speed lines. Loud but timed;
only small idle bobs loop. Reduced motion turns all of it off.

## Don'ts
No pixel-art retro (modern fighting-game energy, not 8-bit); no franchise references; no
emoji; don't bury his face in the film under UI; no unreadable text on fluoro (check contrast).

# Veronica, in two editions

The site has two live editions in peer review, **Mint in Box** and **Versus**. The
old chat (Obsidian Monolith: ember on void, a particle net) matches neither.
Veronica gets one skin per edition; `ChatRoute` picks the visitor's edition and
the engine (`useVeronica`) lives above the skin, so the edition switch swaps her
outfit mid-conversation without losing a word.

Veronica already exists in both worlds: Versus roster **No.03 "THE QUEEN"**,
whose stage button reads "TALK TO HER WEB TWIN", and Mint pegboard **box
No.03** (purple `#7A4CFF`, "WARNING: contains small agents. Not suitable for
clouds."). Both skins build on those existing identities.

## What the skill and the research said

- **ui-ux-pro-max `--design-system`** returned Retro-Futurism: synthwave CRT
  scanlines, Fredoka/Nunito, a blue accent on light grey. That's the stock
  "cool AI chat", and it matches neither edition. **Rejected** as the first
  instinct.
- **Skill UX rule, AI Interaction / Streaming:** "stream text token by token;
  don't show a spinner for 10s+". The old chat buffered whole answers. Both
  skins stream `v.live.content` as it arrives.
- **Reference research** (fighting games, talking toys) produced the mappings
  below. The strongest idea is to turn the AI's real internals (thinking, tool
  calls, latency) into each world's native idiom, so the theme carries
  meaning rather than decoration.

## Shared rules (both skins)

1. **Answers are sacred.** Answer bodies sit on a flat, unskewed, unanimated
   plane: 16–18px, line-height ≥1.55, contrast ≥4.5:1, links visibly styled.
   Skew, halftone, cut-ins and starbursts belong to the chrome only.
2. **One big event per state change.** Thinking, a tool call and the answer
   landing each get one moment. Never run a cut-in, a meter and a counter all
   at full volume together.
3. **Every engine state has a designed look:** empty, thinking, each tool call,
   streaming, done with blocks, stopped (`notice: 'INTERRUPTED'`), error, and a
   long conversation (8+ turns).
4. **Real numbers only.** Any meter or stat shows real data (words streamed,
   time to first token, stream duration, tools fired). No fake stats.
5. **Accessibility:** a `role="log"` / `aria-live="polite"` region announces
   each finished message, not every token. Visible focus everywhere.
   Touch targets ≥44px. Inputs are 16px (no iOS zoom). `prefers-reduced-motion`
   gives a still, complete, readable chat.
6. **Phones first-class:** 390×844, 360×740, landscape 844×390. The input stays
   reachable above the keyboard (`100dvh`, safe-area insets), with no sideways
   scroll.
7. **Chrome:** a back link to the visitor's edition and the edition switch
   (`<EditionSwitch current={skin} onPick={setSkin} always />`) so reviewers
   can flip skins in place.

## VERSUS: "Training Room vs THE QUEEN"

Veronica is the boss who answers for him. The visitor is the challenger, and
the screen is a fight in training mode.

| Engine state | Versus idiom |
|---|---|
| empty | **HERE COMES A NEW CHALLENGER!**: a VS splash, YOU vs VERONICA (No.03 THE QUEEN, "web twin"), with the COMMAND LIST (suggestions) as move inputs |
| your question | a skewed ink slab: `P1 ▸ …`, logged in the left rail's **INPUT HISTORY** (turn number + stick-notation glyphs; click to jump) |
| thinking | her **SUPER meter** fills in the HUD; the thinking text scrolls small in mono like an input display |
| tool call | a **super cut-in** named after the matching Versus section: get_projects → CHARACTER SELECT, get_career_timeline → STORY MODE, get_youtube_videos → REPLAY THEATRE, get_skills → MOVE LIST, get_publications → LORE CODEX, get_honours → TROPHY ROOM, get_bio → PLAYER PROFILE, get_blue_work → FINAL ROUND: BLUE, get_talks → MAIN STAGE |
| streaming answer | a **win-quote box**: her portrait corner and name plate over a calm answer body; a **combo counter** (words streamed, "23 HITS") beside the box, never on the text |
| done | a **frame-data strip** under the answer: STARTUP (time to first token), ACTIVE (stream time), HITS (words), MOVES (tools). All real |
| blocks | data pages in Versus dress (roster cards, round cards, trophies) |
| stopped / error | BLOCKED! (stopped) / **CONNECTION K.O. · CONTINUE?** with a retry |
| input | **ENTER COMMAND** slab with a big skewed **FIGHT ▸** send; stop is **BLOCK ■** |

**Killed in review:** a visual-novel dialogue box with "press to continue"
pagination (long answers become a chore); health bars that drain per question
(it tells the visitor they're losing); an idle K.O. countdown (nagging, and the
contact section already has a countdown).

## MINT IN BOX: "Veronica, talking figure: box No.03, opened flat"

The screen is Veronica's own box, unfolded into a printed dieline (fold lines,
glue flaps, crop marks, colour bars) in her purple, with Mint's yellow and pink.

| Engine state | Mint idiom |
|---|---|
| empty | **box front**: her figure in a blister window (art from `/work/veronica/*.webp`), a chrome VERONICA toy logo, a "TALKS! SAYS 5 THINGS!" starburst, a **TRY ME!** arrow at the speaker grille, and the phrase list printed on the box (suggestions, à la Chatty Cathy) |
| your question | an **instruction-booklet step**: "STEP 3 · YOU ASK:" in a hand-lettered write-in line |
| thinking | "voice chip warming up…": a battery meter charges and the speaker grille glows; the thinking text prints small, like a chip log |
| tool call | a **parts call-out** (LEGO-style): "PARTS NEEDED: 1× PROJECTS PACK", with a progress strip; Teddy Ruxpin's control track running under the voice track |
| streaming answer | "SHE SAYS:" in a big **comic speech bubble** (flat paper, dark ink) with its tail pointing at the figure; the speaker grille pulses while text streams |
| done | the bubble settles, and an "ACCESSORIES INCLUDED" tray holds the blocks |
| blocks | blister-bubble accessory trays (projects), a file-card timeline (career), etc. |
| stopped / error | "PULLED THE TAB" (stopped) / **LOW BATTERY · replace and try again** stamp with a retry |
| input | a **"MY QUESTION:" write-in coupon** with a round red **TRY ME** push button; stop is "PULL TAB ■" |

**Killed in review:** pull-string drag to send (not keyboard-reachable, and
hostile); mail-away "allow 4–6 weeks" answers (fakes latency); a Speak & Spell
8-character display (can't hold an answer); collector condition grades (noise).

## Engine API (do not modify `useVeronica.js`)

```js
v.messages   // [{ role: 'user'|'model', content, thinking, blocks, notice }]
v.live       // in-flight turn: { content, thinking, blocks, tool: { name, label } | null, tools: [] }
v.loading, v.phase ('idle'|'loading'|'error'), v.input, v.setInput, v.send(text), v.stop(), v.suggestions
```
Blocks render with `<ChatBlocks blocks={…} />` (components consume the `--nm-*`
tokens: bg, surface, border, text, text-muted, text-subtle, accent, accent-2).
Dev mock: `#/chat?skin=<skin>&mock=1` (or `mock=slow` to freeze a state). Ask
"robots" for get_projects, "career" for the timeline, "talks" for videos,
"error" for a failure, anything else for plain text.

## Facts from a recorded real turn (read before designing)

`"Show me the robots"` against production, 10.6 s in total:
`thinking ×484 → tool:get_projects → block:get_projects (same tick) → thinking ×515 → text ×383 → done`.

- **Thinking is the state visitors watch longest** (~6–8 s, in two bursts
  around the tool call). Design it as the main event, not a spinner.
- **The text arrives last and fast.** Blocks land before any text, so place
  blocks where text arriving later won't push them around. The recommended
  order is answer text first, blocks below it, with reserved space.
- **Tool moments:** drive cut-ins and call-outs from new entries in
  `v.live.tools` and give each a dwell time in the skin. `v.live.tool` clears
  within the same frame in production.
- **Not every block renders.** The Worker also sends blocks for `get_bio`,
  `get_blue_work` and `get_talks`, which ChatBlocks ignores. Count and label
  only `RENDERABLE = ['get_projects','get_career_timeline','get_skills',
  'get_youtube_videos','get_publications','get_honours']`.
- **Degraded turns** are normal: no thinking, no tools, text only. Also stopped
  mid-thinking, and an error with partial text.
- **Real numbers** come from `message.meta`: `startedAt`, `firstThinkAt`,
  `firstTextAt`, `doneAt`, `tools`, `words` (and `v.live.*` while in flight).
- **Retry** is `v.retry()`, never `v.send(lastQuestion)`, which would duplicate it.

## Implementation notes

- `App.jsx` stops Lenis on `/chat`, and the page must not scroll the window.
  Put the conversation in its own scroller with `data-lenis-prevent`, and test
  it with real wheel/touch events. Stick to the bottom while streaming only if
  the reader is already at the bottom; otherwise show a "new message ↓" pill.
- **Fonts: self-hosted only** (production CSP is `font-src 'self'`; dev has no
  CSP, so an external font works in dev and breaks live). Versus fonts live in
  `src/proposals/versus/fonts.css`, Mint's `@font-face` in
  `src/proposals/mint/mint.css` (`/fonts/mint/*`). The `--vs-*` tokens are
  scoped to `.vs-root` and `--mb-*` to `.mb-root`, so redeclare what you use
  on your skin's root.
- **Veronica's portrait:** Versus crops `/work/veronica/hud.webp` (1280×820) at
  `object-position: 50% 32%`, scale 2.4 (her holographic face). Reuse that crop
  in both skins.
- The phrase count ("SAYS N THINGS") is `v.suggestions.length`.

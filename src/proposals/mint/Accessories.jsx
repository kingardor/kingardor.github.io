import { SKILLS } from '../../content/index.js'
import { Talker } from './parts.jsx'
import { euroHolePath } from './geometry.js'
import { StickerSheet } from './Stickers.jsx'

const TONES = ['ember', 'pink', 'yellow', 'bone']
const LETTERS = ['A', 'B', 'C', 'D']

// Tiny moulded parts: one glyph per family, drawn, not iconfont.
const GLYPHS = {
  chip: 'M5 5h14v14H5zM9 9h6v6H9zM2 8h3M2 12h3M2 16h3M19 8h3M19 12h3M19 16h3M8 2v3M12 2v3M16 2v3M8 19v3M12 19v3M16 19v3',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  gear: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
}
const GLYPH_OF = ['eye', 'bolt', 'gear', 'chip']

const HOLE = euroHolePath(160, 22, 72, 14, 12)

function Card({ g, gi }) {
  return (
    <li className={`mb-acc-card mb-acc-card--${TONES[gi]}`} style={{ '--tilt': `${[-1.6, 1.2, -0.8, 1.8][gi]}deg` }}>
      <svg className="mb-acc-hole" viewBox="0 0 320 44" aria-hidden="true" preserveAspectRatio="xMidYMin meet"><path d={HOLE} /></svg>
      <div className="mb-acc-head">
        <span className="mb-acc-pack">ACCESSORY PACK {LETTERS[gi]}</span>
        <h3>{g.name}</h3>
        <span className="mb-acc-count">{g.items.length} PARTS · SOLD SEPARATELY</span>
      </div>
      <ul className="mb-acc-parts">
        {g.items.map((it, i) => (
          <li key={it} className="mb-part" style={{ '--d': `${(i % 4) * 40}ms` }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={GLYPHS[GLYPH_OF[gi]]} /></svg>
            <span>{it}</span>
          </li>
        ))}
      </ul>
      <p className="mb-acc-fine">Small parts. Big opinions. Every part load-bearing.</p>
    </li>
  )
}

/** SKILLS.groups as accessory blister cards: each item a tiny part in its own bubble.
 *  Two columns either side of the film, so act 3's PCB head stays in view. */
export default function Accessories() {
  const G = SKILLS.groups
  return (
    <section id="mb-accessories" className="mb-acc" aria-labelledby="mb-acc-title">
      <div className="mb-acc-col mb-acc-l">
        <Talker kicker="Act III · the toolkit" title={<span id="mb-acc-title">Accessories sold separately</span>} sub="The figure ships with opinions. These are the parts the opinions run on. Hover to rattle the blister." tone="ember" />
        <ul className="mb-acc-cards">
          <Card g={G[0]} gi={0} />
          <Card g={G[2]} gi={2} />
        </ul>
      </div>
      <div className="mb-acc-col mb-acc-r">
        <StickerSheet />
        <ul className="mb-acc-cards">
          <Card g={G[1]} gi={1} />
          <Card g={G[3]} gi={3} />
        </ul>
      </div>
    </section>
  )
}

import { useRef, useState } from 'react'
import { ROSTER, BOSS } from './data.js'
import { ModeHeader } from './StoryMode.jsx'
import { reduced, shake, flash } from './fx.js'
import { Burst } from './Art.jsx'
import VsScreen from './VsScreen.jsx'

// 3 × 3: four fighters, the boss in the middle, four fighters.
const SLOTS = [0, 1, 2, 3, 'boss', 4, 5, 6, 7]

export function Portrait({ p, className = '', big = false, eager = false }) {
  const { src, w, h, pos, zoom } = p.portrait
  return (
    <span className={`vs-portrait ${className}`}>
      <img
        src={src} width={w} height={h} alt=""
        loading={eager ? 'eager' : 'lazy'} decoding="async"
        style={{ objectPosition: pos, transform: `scale(${big ? zoom * 1.05 : zoom})`, transformOrigin: pos }}
      />
    </span>
  )
}

export default function CharacterSelect() {
  const [active, setActive] = useState(0)
  const [seen, setSeen] = useState(() => new Set([0]))
  const [unlocked, setUnlocked] = useState(false)
  const [fight, setFight] = useState(null)
  const tiles = useRef([])
  const bossRef = useRef(null)
  const lastTile = useRef(null)

  const scout = (i) => {
    setActive(i)
    if (i === 'boss' || seen.has(i)) return
    const next = new Set(seen)
    next.add(i)
    setSeen(next)
    if (next.size === ROSTER.length && !unlocked) unlock(false)
  }

  const unlock = (select = true) => {
    setUnlocked(true)
    if (select) setActive('boss')
    if (!reduced()) {
      flash(0.8, '#FF48B0')
      shake(bossRef.current?.closest('.vs-select-grid'), 9, 360, 80)
    }
  }

  const choose = (i, el) => {
    if (i === 'boss' && !unlocked) { unlock(); return }
    lastTile.current = el
    setActive(i)
    setFight(i === 'boss' ? BOSS : ROSTER[i])
  }

  const onKeyDown = (e, slot) => {
    const dirs = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 3, ArrowUp: -3 }
    if (!(e.key in dirs)) return
    e.preventDefault()
    const next = (slot + dirs[e.key] + 9) % 9
    tiles.current[next]?.focus()
  }

  const cur = active === 'boss' ? null : ROSTER[active]
  const scouted = seen.size

  return (
    <section id="vs-select" className="vs-section vs-select" aria-labelledby="vs-select-h">
      <ModeHeader
        id="vs-select-h"
        no={4}
        title="CHARACTER SELECT"
        sub="PROJECTS · 8 FIGHTERS · 1 LOCKED SLOT · HOVER TO SCOUT, ENTER TO FIGHT"
        taunt="Pick a fighter. They’re all his."
        ink="yellow"
        compact
      />
      <div className="vs-select-stage">
        <div className="vs-select-preview" aria-live="polite">
          {cur ? (
            <div className={`vs-pv vs-ink-${cur.ink}`} key={cur.slug}>
              <Portrait p={cur} className="vs-pv-portrait" big eager />
              <span className="vs-pv-no" aria-hidden="true">{String(cur.n).padStart(2, '0')}</span>
              <div className="vs-pv-info">
                <p className="vs-pv-alias">{cur.alias} · {cur.year}</p>
                <h3 className="vs-pv-name">{cur.name}</h3>
                <p className="vs-pv-kicker">{cur.kicker}</p>
                <dl className="vs-pv-stats">
                  {cur.stats.map(([k, v]) => (
                    <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
              </div>
              <blockquote className="vs-pv-taunt">
                <p>{cur.taunt}</p>
                {cur.tauntBy && <cite>{cur.tauntBy}</cite>}
              </blockquote>
            </div>
          ) : (
            <div className="vs-pv vs-pv-boss" key="boss">
              <Burst className="vs-pv-boss-burst" seed={77} spikes={22} inks={['pink', 'yellow']} />
              <span className="vs-pv-boss-name" aria-hidden="true">BLUE</span>
              <div className="vs-pv-info">
                <p className="vs-pv-alias">{BOSS.alias} · 2025</p>
                <h3 className="vs-pv-name">BLUE</h3>
                <p className="vs-pv-kicker">{BOSS.kicker}</p>
                <dl className="vs-pv-stats">
                  <div><dt>PRODUCTS</dt><dd>6</dd></div>
                  <div><dt>FEWER CALLS</dt><dd>73%</dd></div>
                  <div><dt>FEWER TOKENS</dt><dd>55%</dd></div>
                  <div><dt>DEEP SCAN</dt><dd>NO GUESSING</dd></div>
                </dl>
              </div>
              <blockquote className="vs-pv-taunt"><p>{BOSS.pitch}</p></blockquote>
            </div>
          )}
        </div>

        <div className="vs-select-side">
          <div className="vs-select-grid" role="group" aria-label="Roster">
            {SLOTS.map((s, slot) => {
              if (s === 'boss') {
                return (
                  <button
                    key="boss" type="button"
                    ref={el => { tiles.current[slot] = el; bossRef.current = el }}
                    className={`vs-tile vs-tile-boss${unlocked ? ' is-unlocked' : ''}${active === 'boss' ? ' is-active' : ''}`}
                    onMouseEnter={() => unlocked && setActive('boss')}
                    onFocus={() => unlocked && setActive('boss')}
                    onClick={(e) => choose('boss', e.currentTarget)}
                    onKeyDown={(e) => onKeyDown(e, slot)}
                    aria-label={unlocked ? 'BLUE, the final boss. Fight' : `Locked slot. ${scouted} of 8 fighters scouted. Click to force it open`}
                  >
                    {unlocked
                      ? <span className="vs-tile-boss-mark">BLUE</span>
                      : <span className="vs-tile-q" aria-hidden="true">?</span>}
                    <span className="vs-tile-name">{unlocked ? 'BOSS' : `${scouted}/8`}</span>
                  </button>
                )
              }
              const p = ROSTER[s]
              return (
                <button
                  key={p.slug} type="button"
                  ref={el => { tiles.current[slot] = el }}
                  className={`vs-tile vs-ink-${p.ink}${active === s ? ' is-active' : ''}${seen.has(s) ? ' is-seen' : ''}`}
                  onMouseEnter={() => scout(s)}
                  onFocus={() => scout(s)}
                  onClick={(e) => choose(s, e.currentTarget)}
                  onKeyDown={(e) => onKeyDown(e, slot)}
                  aria-label={`${p.name}, ${p.kicker}. Fight`}
                >
                  <Portrait p={p} />
                  <span className="vs-tile-n" aria-hidden="true">{String(p.n).padStart(2, '0')}</span>
                  <span className="vs-tile-name" aria-hidden="true">{p.short}</span>
                </button>
              )
            })}
          </div>
          <p className="vs-select-hint">
            <span className="vs-select-p1">P1 CURSOR</span>
            {unlocked ? 'BOSS SLOT OPEN. YOU ASKED FOR THIS.' : `SCOUT ALL 8 TO OPEN THE ? SLOT · ${scouted}/8`}
          </p>
        </div>
      </div>
      {fight && (
        <VsScreen
          fighter={fight}
          onClose={() => {
            setFight(null)
            requestAnimationFrame(() => lastTile.current?.focus({ preventScroll: true }))
          }}
        />
      )}
    </section>
  )
}

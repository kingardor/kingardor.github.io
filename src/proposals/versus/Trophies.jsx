import { useEffect, useRef, useState } from 'react'
import { TROPHIES, TIER_ORDER } from './data.js'
import { ModeHeader } from './StoryMode.jsx'
import { reduced } from './fx.js'
import { TrophyIcon } from './Art.jsx'

const SHELVES = [
  { name: 'PLATINUM + GOLD', tiers: ['platinum', 'gold'] },
  { name: 'SILVER', tiers: ['silver'] },
  { name: 'BRONZE', tiers: ['bronze'] },
]
const TOTAL = TROPHIES.length

export default function Trophies() {
  const [got, setGot] = useState(() => (reduced() ? new Set(TROPHIES.map(t => t.id)) : new Set()))
  const [toasts, setToasts] = useState([])
  const listRef = useRef(null)

  useEffect(() => {
    if (reduced()) return
    const root = listRef.current
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const id = Number(e.target.dataset.id)
        io.unobserve(e.target)
        setGot(s => (s.has(id) ? s : new Set(s).add(id)))
        const t = TROPHIES[id]
        const key = `${id}-${Date.now()}`
        setToasts(ts => [...ts.slice(-2), { key, t }])
        setTimeout(() => setToasts(ts => ts.filter(x => x.key !== key)), 2600)
      }
    }, { rootMargin: '0px 0px -22% 0px' })
    root.querySelectorAll('[data-id]').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  const pct = Math.round((got.size / TOTAL) * 100)
  const sorted = [...TROPHIES].sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier))

  return (
    <section id="vs-trophies" className="vs-section vs-trophies" aria-labelledby="vs-trophies-h">
      <ModeHeader
        id="vs-trophies-h"
        no={7}
        title="TROPHY ROOM"
        sub="HONOURS · ONE GTC TALK · TWO NASA WINS · ONE BEST PAPER"
        taunt="Platinum for a GTC talk. Show-off."
        side="right"
        ink="hi"
      />
      <div className="vs-trophy-room" ref={listRef}>
        <p className="vs-completion" aria-live="polite">
          <span>TROPHIES {got.size}/{TOTAL}</span>
          <span className="vs-completion-bar" aria-hidden="true"><i style={{ transform: `scaleX(${got.size / TOTAL})` }} /></span>
          <span>{pct}%{pct === 100 ? ' · COMPLETE' : ''}</span>
        </p>
        {SHELVES.map(sh => (
          <div className="vs-shelf" key={sh.name}>
            <p className="vs-shelf-name">{sh.name}</p>
            <ul className="vs-shelf-row">
              {sorted.filter(t => sh.tiers.includes(t.tier)).map(t => {
                const on = got.has(t.id)
                const Wrap = t.url ? 'a' : 'div'
                const wp = t.url ? { href: t.url, target: '_blank', rel: 'noreferrer' } : {}
                return (
                  <li key={t.id} data-id={t.id} className={`vs-trophy vs-tier-${t.tier}${on ? ' is-on' : ''}`}>
                    <Wrap className="vs-trophy-in" {...wp}>
                      <span className="vs-trophy-icon"><TrophyIcon tier={t.tier} /></span>
                      <span className="vs-trophy-tier">{t.tier.toUpperCase()} · {on ? 'UNLOCKED' : 'LOCKED'}</span>
                      <span className="vs-trophy-name">{t.name}</span>
                      <span className="vs-trophy-title">{t.title}</span>
                      <span className="vs-trophy-sub">{t.sub}</span>
                    </Wrap>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="vs-toasts" aria-hidden="true">
        {toasts.map(({ key, t }) => (
          <div className={`vs-toast vs-tier-${t.tier}`} key={key}>
            <span className="vs-toast-icon"><TrophyIcon tier={t.tier} /></span>
            <span className="vs-toast-txt"><b>TROPHY UNLOCKED</b>{t.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

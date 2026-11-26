import { HONOURS } from '../../content/index.js'
import { Talker } from './parts.jsx'

// Which object each honour becomes on the shelf.
const FORM = { GTC: 'mic', 'Z BY HP': 'holo', NASA: 'rocket', NVIDIA: 'pin', EOY: 'cup', SIH: 'medal', PAPER: 'plaque' }

function Trophy({ form, label }) {
  switch (form) {
    case 'cup':
      return (
        <svg viewBox="0 0 100 130" aria-hidden="true" className="mb-tro-svg">
          <defs><linearGradient id="mbCup" x1="0" x2="1"><stop offset="0" stopColor="#7a5408" /><stop offset=".35" stopColor="#ffe28a" /><stop offset=".55" stopColor="#d9a52c" /><stop offset="1" stopColor="#6b4705" /></linearGradient></defs>
          <path d="M26 10h48v26c0 16-10 28-24 28S26 52 26 36z" fill="url(#mbCup)" />
          <path d="M26 16H12c0 18 8 24 16 26M74 16h14c0 18-8 24-16 26" fill="none" stroke="#c9952a" strokeWidth="4" />
          <rect x="45" y="64" width="10" height="22" fill="url(#mbCup)" />
          <path d="M30 86h40l6 14H24z" fill="url(#mbCup)" />
          <rect x="18" y="100" width="64" height="24" rx="2" fill="#1b1410" />
          <text x="50" y="116" textAnchor="middle" fill="#e8c46a" fontFamily="MB Bungee" fontSize="10">{label}</text>
        </svg>
      )
    case 'rocket':
      return (
        <svg viewBox="0 0 100 130" aria-hidden="true" className="mb-tro-svg">
          <defs><linearGradient id="mbRk" x1="0" x2="1"><stop offset="0" stopColor="#8a96a8" /><stop offset=".4" stopColor="#fff" /><stop offset="1" stopColor="#5b6576" /></linearGradient></defs>
          <path d="M50 6c14 14 18 36 14 62H36c-4-26 0-48 14-62z" fill="url(#mbRk)" />
          <circle cx="50" cy="38" r="7" fill="#0B1E4D" stroke="#fff" strokeWidth="2" />
          <path d="M36 54l-12 18h14zM64 54l12 18H62z" fill="#FF3D00" />
          <path d="M42 68h16l-3 12h-10z" fill="#ffb000" />
          <rect x="22" y="96" width="56" height="28" rx="2" fill="#0B1E4D" />
          <text x="50" y="114" textAnchor="middle" fill="#fff" fontFamily="MB Bungee" fontSize="10">{label}</text>
        </svg>
      )
    case 'mic':
      return (
        <svg viewBox="0 0 100 130" aria-hidden="true" className="mb-tro-svg">
          <defs><linearGradient id="mbMic" x1="0" x2="1"><stop offset="0" stopColor="#3a3a3a" /><stop offset=".45" stopColor="#d8d8d8" /><stop offset="1" stopColor="#2a2a2a" /></linearGradient></defs>
          <rect x="36" y="8" width="28" height="44" rx="14" fill="url(#mbMic)" />
          <path d="M40 18h20M40 26h20M40 34h20M40 42h20" stroke="#222" strokeWidth="1.5" />
          <path d="M28 40c0 14 10 22 22 22s22-8 22-22" fill="none" stroke="#bbb" strokeWidth="3" />
          <rect x="47" y="62" width="6" height="26" fill="url(#mbMic)" />
          <rect x="18" y="96" width="64" height="28" rx="2" fill="#121014" />
          <text x="50" y="114" textAnchor="middle" fill="#FF3D00" fontFamily="MB Bungee" fontSize="11">{label}</text>
        </svg>
      )
    case 'medal':
      return (
        <svg viewBox="0 0 100 130" aria-hidden="true" className="mb-tro-svg">
          <path d="M34 4h14l10 40H44zM66 4H52l-10 40h14z" fill="#FF2E88" />
          <path d="M40 4h6l8 40h-4zM60 4h-6l-8 40h4z" fill="#fff" opacity=".6" />
          <circle cx="50" cy="74" r="30" fill="#d7a43a" stroke="#8a5f0f" strokeWidth="3" />
          <circle cx="50" cy="74" r="22" fill="none" stroke="#fff4c0" strokeWidth="1" opacity=".7" />
          <text x="50" y="81" textAnchor="middle" fill="#5a3a00" fontFamily="MB Bungee" fontSize="17">{label}</text>
        </svg>
      )
    case 'plaque':
      return (
        <svg viewBox="0 0 100 130" aria-hidden="true" className="mb-tro-svg">
          <rect x="12" y="16" width="76" height="104" rx="4" fill="#3a2414" />
          <rect x="20" y="24" width="60" height="88" rx="2" fill="#e2c37a" />
          <path d="M30 40h40M30 50h40M30 60h28" stroke="#5a3a00" strokeWidth="2" />
          <text x="50" y="92" textAnchor="middle" fill="#5a3a00" fontFamily="MB Bungee" fontSize="12">{label}</text>
        </svg>
      )
    case 'pin':
      return (
        <svg viewBox="0 0 100 130" aria-hidden="true" className="mb-tro-svg">
          <path d="M50 20l34 20v40L50 100 16 80V40z" fill="#121014" stroke="#9DFF00" strokeWidth="3" />
          <path d="M50 32l24 14v28L50 88 26 74V46z" fill="none" stroke="#9DFF00" strokeWidth="1" opacity=".6" />
          <text x="50" y="66" textAnchor="middle" fill="#9DFF00" fontFamily="MB Bungee" fontSize="11">{label}</text>
        </svg>
      )
    default: // holo
      return (
        <svg viewBox="0 0 100 130" aria-hidden="true" className="mb-tro-svg mb-tro-holo">
          <defs><linearGradient id="mbHolo2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff9de2" /><stop offset=".3" stopColor="#a5f3ff" /><stop offset=".6" stopColor="#fff6a8" /><stop offset="1" stopColor="#c6a7ff" /></linearGradient></defs>
          <circle cx="50" cy="62" r="40" fill="url(#mbHolo2)" stroke="#111" strokeWidth="2" />
          <circle cx="50" cy="62" r="32" fill="none" stroke="#111" strokeWidth=".8" strokeDasharray="2 2" />
          <text x="50" y="58" textAnchor="middle" fill="#111" fontFamily="MB Bungee" fontSize="10">AMBASSADOR</text>
          <text x="50" y="74" textAnchor="middle" fill="#111" fontFamily="MB Bungee" fontSize="12">{label}</text>
        </svg>
      )
  }
}

/** HONOURS on a lit glass shelf. */
export default function TrophyShelf() {
  const items = HONOURS
  return (
    <section id="mb-shelf" className="mb-shelf" aria-labelledby="mb-shelf-title">
      <Talker kicker="Act VII · honours" title={<span id="mb-shelf-title">The trophy shelf</span>} sub="Lit, dusted, slightly smug. Do not touch the glass." tone="gold" />

      <div className="mb-glass">
        <span className="mb-glass-light" aria-hidden="true" />
        <ul className="mb-glass-row">
          {items.map((h, i) => (
            <li key={h.title} className="mb-tro" style={{ '--i': i }}>
              <div className="mb-tro-obj"><Trophy form={FORM[h.key]} label={h.key === 'Z BY HP' ? 'Z BY HP' : h.key} /></div>
              <div className="mb-tro-plate">
                <b>{h.title}</b>
                <span>{h.issuer} · {h.year}</span>
              </div>
            </li>
          ))}
        </ul>
        <span className="mb-glass-edge" aria-hidden="true" />
      </div>
    </section>
  )
}

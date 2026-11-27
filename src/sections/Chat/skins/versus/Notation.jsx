// Stick notation: motion arrows in rings, then her Q button as an inked disc.
const ROT = { 6: 0, 3: 45, 2: 90, 1: 135, 4: 180, 7: 225, 8: 270, 9: 315 }

/** `input` is numpad directions; the Q button is always appended. */
export default function Notation({ input = [], small = false, label }) {
  return (
    <span className={`vq-input${small ? ' is-small' : ''}`} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {input.map((d, i) => (
        <svg key={i} className="vq-key" viewBox="0 0 32 32" aria-hidden="true" style={{ '--i': i }}>
          <circle cx="16" cy="16" r="13.5" className="vq-key-ring" />
          <g transform={`rotate(${ROT[d] ?? 0} 16 16)`}>
            <path d="M8.5 16 H22 M17 10.5 L22.5 16 L17 21.5" className="vq-key-arrow" />
          </g>
        </svg>
      ))}
      {input.length > 0 && <span className="vq-key-plus" aria-hidden="true">+</span>}
      <svg className="vq-key vq-key-q" viewBox="0 0 32 32" aria-hidden="true" style={{ '--i': input.length }}>
        <circle cx="16" cy="16" r="14" />
        <text x="16" y="21.5" textAnchor="middle">Q</text>
      </svg>
    </span>
  )
}

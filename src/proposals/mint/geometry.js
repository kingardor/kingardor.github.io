// Die-cut paths, in px, for clip-path: path() and inline SVG.
/** A euro hang-hole slot path (sombrero slot), centred on cx, cy. */
export function euroHolePath(cx, cy, W, h, r) {
  const top = cy - h / 2, bot = cy + h / 2
  const ccy = top - r * 0.38
  const dx = Math.sqrt(r * r - (top - ccy) ** 2)
  return [
    `M${cx - W / 2 + h / 2} ${bot}`,
    `A${h / 2} ${h / 2} 0 0 1 ${cx - W / 2 + h / 2} ${top}`,
    `L${cx - dx} ${top}`,
    `A${r} ${r} 0 1 1 ${cx + dx} ${top}`,
    `L${cx + W / 2 - h / 2} ${top}`,
    `A${h / 2} ${h / 2} 0 0 1 ${cx + W / 2 - h / 2} ${bot}`,
    'Z',
  ].join(' ')
}

export function roundRectPath(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
}


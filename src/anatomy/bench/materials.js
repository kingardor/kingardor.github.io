// Real colours of the real things, each expanded into the kit's four-tone
// ladder (shade 0..3 by facing, a lighter top) plus its own line tones, so a
// coloured part keeps the same shading discipline as a monochrome one.
export const MATERIALS = {
  oak: '#b27a44',
  frame: '#d4471c',
  ply: '#a88b62',
  rubber: '#26272a',
  steel: '#9aa2ab',
  steeldark: '#5b616a',
  matgreen: '#2c7656',
  white: '#d8d6cf',
  white2: '#e6e4de',
  black: '#2a2c30',
  charcoal: '#3b3e45',
  charcoal2: '#454952',
  glass: '#14161b',
  noir: '#222327',
  noir2: '#2f3136',
  pcbnavy: '#24409a',
  pcbblack: '#22252a',
  pcbgreen: '#2c4a3c',
  chip: '#1b1c20',
  brass: '#c79a3a',
  heatsink: '#2c3036',
  grey: '#8f959c',
  pink: '#ff2e93',
  cabin: '#3a2236',
  mustard: '#eaa823',
  slate: '#474b54',
  plinth: '#1f2024',
  ember: '#ff4d1f',
  cable: '#2b2d31',
  cableyellow: '#f2c21b',
  cablewhite: '#cfcdc6',
  gold: '#d6a841',
  ledred: '#ff3b30',
  ledgreen: '#39d98a',
  blue: '#2f6fe0',
  teal: '#178f8a',
  cardboard: '#b68a57',
}

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
const out = (rgb) => '#' + rgb.map((c) => Math.round(Math.max(0, Math.min(1, c)) * 255).toString(16).padStart(2, '0')).join('')
const mix = (a, b, t) => a.map((c, i) => c + (b[i] - c) * t)
const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b
const WHITE = [1, 1, 1]
const BLACK = [0, 0, 0]

export function tokensOf(base) {
  const c = hex(base)
  const dark = lum(c) < 0.06
  // Dark materials step by adding light, so their four faces still separate.
  const shade = (i) => (dark ? mix(c, WHITE, [0, 0.03, 0.06, 0.09][i]) : mix(c, BLACK, [0.38, 0.27, 0.15, 0.04][i]))
  const top = dark ? mix(c, WHITE, 0.17) : mix(c, WHITE, 0.16)
  return {
    '--anatomy-paper': out(shade(1)),
    '--anatomy-shade-0': out(shade(0)),
    '--anatomy-shade-1': out(shade(1)),
    '--anatomy-shade-2': out(shade(2)),
    '--anatomy-shade-3': out(shade(3)),
    '--anatomy-top': out(top),
    '--anatomy-face': out(mix(c, WHITE, 0.08)),
    '--anatomy-lit-top': out(mix(c, WHITE, 0.3)),
    '--anatomy-lit-shade': out(mix(c, WHITE, 0.12)),
    '--anatomy-hi': out(mix(c, WHITE, dark ? 0.42 : 0.5)),
    '--anatomy-mid': out(mix(c, WHITE, dark ? 0.24 : 0.22)),
    '--anatomy-lo': out(dark ? mix(c, BLACK, 0.55) : mix(c, BLACK, 0.5)),
    '--anatomy-faint': out(dark ? mix(c, WHITE, 0.1) : mix(c, BLACK, 0.3)),
    '--anatomy-dot': out(mix(c, WHITE, 0.72)),
    '--bn-text': out(dark ? mix(c, WHITE, 0.55) : mix(c, BLACK, 0.62)),
    '--bn-text-on': out(dark ? mix(c, WHITE, 0.95) : mix(c, BLACK, 0.85)),
  }
}

export function materialCss() {
  return Object.entries(MATERIALS)
    .map(([name, base]) => `.bn .bm-${name}{${Object.entries(tokensOf(base)).map(([key, value]) => `${key}:${value}`).join(';')}}`)
    .join('\n')
}

// World layout and camera for "The Bench". Units are about 1 px of the drawing;
// x runs along the bench, y toward the front edge, z up. The bench top is z = 0.
import { fitProjection, iso, boxCorners } from '../kit/iso-kit.mjs'

export const W = 820
export const AZIMUTH = 58
const PAD = 22

export const TOP = { x: -240, y: -112, w: 480, d: 224, r: 4 }
export const TOP_H = 16
export const LEG = 16
export const LEG_INSET = 12
export const FLOOR = -46

// Where each object sits on the bench (centres, plan extents).
export const STRIP = { x: -128, y: -108, w: 108, d: 20, r: 3 }
export const STRIP_H = 11
export const SOCKETS = [18, 45, 72].map((dx) => STRIP.x + dx)
export const JETSON = { x: -232, y: -106, w: 80, d: 70, r: 2 }
export const VECTOR = { cx: -182, cy: 26 }
export const DOCK = { x: -236, y: 6, w: 30, d: 26, r: 5 }
export const NOIR = { cx: -22, cy: 38 }
export const MUG = { cx: 36, cy: 38, r: 12.5 }
export const CAR = { cx: 84, cy: 80 }
export const TELLO = { cx: 172, cy: 28 }
export const PAD_AT = { cx: -108, cy: 75 }
export const UNOQ = { x: 10, y: -84, w: 68, d: 50, r: 3 }
export const CCTV = { post: [196, -96], top: 62 }
export const MAT = { x: -62, y: -24, w: 180, d: 122, r: 3 }

const extremes = [
  ...boxCorners(TOP, FLOOR, 0),
  [CCTV.post[0], CCTV.post[1], 92],
  [CCTV.post[0] - 10, CCTV.post[1] + 26, 90],
]

function sized() {
  const unit = { origin: [0, 0], scale: 1, azimuth: AZIMUTH }
  const flat = extremes.map((p) => iso(p, unit))
  const xs = flat.map(([x]) => x)
  const ys = flat.map(([, y]) => y)
  const scale = (W - PAD * 2) / (Math.max(...xs) - Math.min(...xs))
  return Math.round((Math.max(...ys) - Math.min(...ys)) * scale + PAD * 2)
}

export const H = sized()
export const P = fitProjection(extremes, W, H, { pad: PAD, azimuth: AZIMUTH })
export const at = (point) => iso(point, P)

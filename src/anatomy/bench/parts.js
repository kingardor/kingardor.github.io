// Parts that are drawn both at build time (rest pose, recorded for the audit)
// and in the page (re-drawn while they move): Noir's camera turret, the CCTV
// head, and the cable tails that follow a lifted board.
import * as k from '../kit/iso-kit.mjs'
import * as G from '../kit/lathe.mjs'
import { tubePieces, tubeSvg } from '../kit/tube.mjs'
import { P, at, NOIR, CCTV, SOCKETS, STRIP, STRIP_H, UNOQ } from './view.js'

export const M = (name, inner) => `<g class="bm bm-${name}">${inner}</g>`
export const S = (paths, style = {}) => k.solidSvg(paths, { crease: 'faint', ...style })
export const Ln = (d, style) => k.lineSvg(d, style)
export const Dt = (points, style) => k.dotsSvg(points, style)
const DEG = Math.PI / 180

// ---- Noir's camera turret ---------------------------------------------------
export const TURRET = { x: NOIR.cx - 2, y: NOIR.cy, z0: 29.3, h: 8.5, rest: 0 }
const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]

export function turretAt(deg) {
  const a = deg * DEG
  const box = k.roundedPlan({ x: -7.5, y: -5.5, w: 15, d: 11, r: 2.4 }, 4).map((p) => {
    const [x, y] = rot(p, a)
    return [TURRET.x + x, TURRET.y + y]
  })
  const head = k.extrude(box, TURRET.z0, TURRET.h, P, { bevel: 0.5 })
  const dir = [Math.cos(a), Math.sin(a), 0]
  const lensAt = [TURRET.x + dir[0] * 7.5, TURRET.y + dir[1] * 7.5, TURRET.z0 + TURRET.h / 2 + 0.4]
  const F = G.frameAlong(lensAt, dir)
  const facing = G.dot3(dir, G.viewOf(P)) > 0.05
  const bezel = G.disc(0, 1.2, 3.8, F, P, { bevel: 0.25 })
  const glass = G.disc(1.2, 1.7, 2.7, F, P)
  const glint = facing ? Dt([at(G.pointOf(F, 1.7, 1.2, 2.2))], { size: 0.55, tone: 'hi' }) : ''
  const ring = facing ? Ln(G.circleOf(F, 1.2, 3.1, P, 28), { tone: 'lo' }) : ''
  // a status LED on the turret's top, and a seam that wraps the head
  const ledAt = [TURRET.x + rot([-4, 3], a)[0], TURRET.y + rot([-4, 3], a)[1], TURRET.z0 + TURRET.h]
  const seam = k.ringSeam(box, TURRET.z0 + 3, P)
  const svg =
    M('noir2', S(head, { tone: 'hi', inner: Ln(seam, { tone: 'faint' }) })) +
    M('steel', S(bezel, { tone: 'mid' }) + ring) +
    M('glass', S(glass, { tone: 'lo', crease: 'none' }) + glint) +
    M('ledred', Dt([at(ledAt)], { size: 0.65, tone: 'hi' }))
  const solids = [
    { kind: 'extruded', ring: box, z: TURRET.z0, h: TURRET.h, name: 'noir.turret' },
    { kind: 'disc', F, s0: 0, s1: 1.7, r: 3.8, name: 'noir.lens' },
  ]
  return { svg, solids, mid: [TURRET.x, TURRET.y, TURRET.z0 + TURRET.h / 2] }
}

// ---- The CCTV head: a bullet camera on a pan head ----------------------------
export const CAM = { x: CCTV.post[0], y: CCTV.post[1], pan: CCTV.top + 4, axisZ: CCTV.top + 17, tilt: 11, R: 7.6, rest: 104 }

export function cctvAt(deg) {
  const a = deg * DEG
  const t = CAM.tilt * DEG
  const dir = [Math.cos(a) * Math.cos(t), Math.sin(a) * Math.cos(t), -Math.sin(t)]
  const side = G.unit3([-Math.sin(a), Math.cos(a), 0])
  const up = G.cross3(dir, side)
  const centre = [CAM.x, CAM.y, CAM.axisZ]
  const F = G.frameOf(centre, dir, side, up)
  const body = G.solidOf(
    [
      [-15, 6.4],
      [-14, 7.3, 1],
      [-12.2, CAM.R, 1],
      [17, CAM.R],
      [17, CAM.R + 0.6],
      [21, CAM.R + 0.6],
    ],
    F,
    P,
    { smooth: { rows: 4 } },
  )
  const seams = Ln(G.arcOf(F, 4, CAM.R, P), { tone: 'faint' })
  const V = G.viewOf(P)
  const facing = G.dot3(dir, V) > 0.12
  const face = facing
    ? M('glass', S(G.disc(21, 21.3, CAM.R - 0.6, F, P), { tone: 'lo', crease: 'none' })) +
      M('glass', Ln(G.circleOf(F, 21.3, 3.2, P, 32), { tone: 'mid' }) + Dt([at(G.pointOf(F, 21.3, 1.4, 2.3))], { size: 0.6, tone: 'hi' })) +
      M('ledred', Dt(G.dotsOf(F, 21.3, 5.2, 10, P, { all: true }), { size: 0.42, tone: 'mid' }))
    : ''
  // flat sun visor over the top, from behind the middle to past the glass
  const visorF = G.frameOf(centre, dir, side, up)
  const visorPoly = [
    [-CAM.R - 1.4, CAM.R + 0.62],
    [CAM.R + 1.4, CAM.R + 0.62],
    [CAM.R + 1.4, CAM.R + 1.8],
    [-CAM.R - 1.4, CAM.R + 1.8],
  ]
  const visor = G.prismOf(visorF, visorPoly, -9, 26, P)
  const neckTop = CAM.axisZ - Math.sqrt(CAM.R ** 2 - 2.6 ** 2) - 0.6
  const head = k.cylinder(CAM.x, CAM.y, 4.6, CAM.pan, 3, P, 28, 0.3)
  const neck = k.cylinder(CAM.x, CAM.y, 2.6, CAM.pan + 3, neckTop - CAM.pan - 3, P, 20)
  const svg =
    M('white', S(head, { tone: 'hi' })) +
    M('white', S(neck, { tone: 'hi', crease: 'none' })) +
    M('white', S(body, { tone: 'hi', inner: seams })) +
    face +
    M('white2', S(visor, { tone: 'hi' }))
  const solids = [
    { kind: 'cylinder', cx: CAM.x, cy: CAM.y, r: 4.6, z: CAM.pan, h: 3, name: 'cctv.panhead' },
    { kind: 'cylinder', cx: CAM.x, cy: CAM.y, r: 2.6, z: CAM.pan + 3, h: neckTop - CAM.pan - 3, name: 'cctv.neck' },
    { kind: 'solid', F, profile: [[-15, 6.4], [-14, 7.3], [-12.2, CAM.R], [17, CAM.R], [17, CAM.R + 0.6], [21.3, CAM.R + 0.6]], name: 'cctv.body' },
    { kind: 'prism', F: visorF, polygon: visorPoly, s0: -9, s1: 26, name: 'cctv.visor' },
  ]
  return { svg, solids, mid: centre }
}

// ---- Cables -------------------------------------------------------------------
// Each cable leaves a plug in the power strip and lies on the bench (z = r).
// The two that feed a board pass through an adhesive clip; the tail after the
// clip is re-drawn when its board lifts.
const PLUG_Y = STRIP.y + STRIP.d + 8
const PZ = 5.5
const J_Y = -42.5
const U_Y = UNOQ.y + 34.5
const C_Y = -97.5
export const CABLES = {
  jetson: { r: 1.35, mat: 'cable', points: [[SOCKETS[0], PLUG_Y, PZ], [SOCKETS[0], PLUG_Y + 5, PZ], [SOCKETS[0], PLUG_Y + 16, 1.35], [SOCKETS[0], J_Y, 1.35], [-124, J_Y, 1.35]], tail: [[-128, J_Y, 1.35], [-138, J_Y, 1.35], [-145, J_Y, 8.8], [-151, J_Y, 8.8]], clip: -1, bend: 9, piece: 'jetson' },
  dock: { r: 1.2, mat: 'cable', points: [[SOCKETS[1], PLUG_Y, PZ], [SOCKETS[1], PLUG_Y + 5, PZ], [SOCKETS[1], PLUG_Y + 16, 1.2], [SOCKETS[1], -14, 1.2], [-221, -14, 1.2], [-221, 6, 1.2]], bend: 10, piece: 'dock' },
  unoq: { r: 1.15, mat: 'cableyellow', points: [[SOCKETS[2], PLUG_Y, PZ], [SOCKETS[2], PLUG_Y + 5, PZ], [SOCKETS[2], PLUG_Y + 16, 1.15], [SOCKETS[2], U_Y, 1.15], [-20, U_Y, 1.15]], tail: [[-16, U_Y, 1.15], [-5, U_Y, 1.15], [1, U_Y, 7.3], [UNOQ.x - 3, U_Y, 7.3]], clip: 1, bend: 10, piece: 'unoq' },
  cctv: { r: 1.25, mat: 'cablewhite', points: [[STRIP.x + STRIP.w + 8, C_Y, PZ], [STRIP.x + STRIP.w + 13, C_Y, PZ], [STRIP.x + STRIP.w + 24, C_Y, 1.25], [164, C_Y, 1.25], [175, C_Y, 7], [CCTV.post[0] - 11, C_Y, 7]], bend: 9, piece: 'strip' },
}
export const STRIP_TOP = STRIP_H

export function routeOf(points, r, bend) {
  return G.fillet(points, bend, 10, { P, tube: r })
}

// The tail of a clipped cable, with its board lifted by `lift`.
export function tailRoute(name, lift = 0) {
  const c = CABLES[name]
  const pts = c.tail.map((p, i) => {
    const w = i === 0 ? 0 : i === 1 ? 0.25 : 1
    return [p[0], p[1], p[2] + lift * w]
  })
  return routeOf(pts, c.r, 4.5)
}

export function tailSvg(name, lift = 0) {
  const c = CABLES[name]
  const route = tailRoute(name, lift)
  const pieces = tubePieces(route, c.r, P, { maxLength: 400, spacing: 1, caps: [false, true] })
  return M(c.mat, pieces.map((piece) => tubeSvg(piece, { tone: 'mid' })).join(''))
}

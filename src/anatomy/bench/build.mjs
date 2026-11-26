// Builds "The Bench": every static part is computed here once, recorded for the
// audit, depth-settled, and written to bench.data.js as finished SVG strings.
//   node src/anatomy/bench/build.mjs           write the data module
//   node src/anatomy/bench/build.mjs --audit   ... and prove the geometry
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as k from '../kit/iso-kit.mjs'
import * as G from '../kit/lathe.mjs'
import * as A from '../kit/audit.mjs'
import { tubePieces, tubeSvg } from '../kit/tube.mjs'
import { W, H, P, at, TOP, TOP_H, LEG, LEG_INSET, FLOOR, STRIP, STRIP_H, SOCKETS, JETSON, VECTOR, DOCK, NOIR, MUG, CAR, TELLO, PAD_AT, UNOQ, CCTV, MAT } from './view.js'
import { M, S, Ln, Dt, turretAt, cctvAt, TURRET, CAM, CABLES, routeOf, tailRoute, tailSvg } from './parts.js'
import { materialCss } from './materials.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const R = A.recorder(P)
const KS = G.scaleOf(P)
const V = G.viewOf(P)
const DEG = Math.PI / 180

// ---- helpers ------------------------------------------------------------------
const rec = (shape) => R.solid(shape)
function put(piece, obj, point, svg, { bias = 0, shapes = [], name, live, route, chunk } = {}) {
  R.put({ piece, obj: obj ?? piece, at: point, bias, svg, shapes, name: name ?? R.nameFor(`${piece}.item`), live, route, chunk })
}
const mid = (plan, z, h) => [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2]
const named = (piece, name) => R.nameFor(`${piece}.${name}`)

function box(piece, name, plan, z, h, mat, { steps = 4, bevel = 0, tone = 'hi', crease = 'faint', inner = '', extra = '', obj, bias = 0, flat = false } = {}) {
  const id = named(piece, name)
  const shape = rec(A.slab(plan, z, h, { name: id }, steps))
  put(piece, obj, mid(plan, z, h), M(mat, S(k.slabOf(plan, z, h, P, steps, bevel), { tone, crease, inner, flat })) + extra, { bias, shapes: [shape], name: id })
  return id
}
function cyl(piece, name, cx, cy, r, z, h, mat, { steps = 28, bevel = 0, tone = 'hi', crease = 'faint', inner = '', extra = '', obj, bias = 0 } = {}) {
  const id = named(piece, name)
  const shape = rec(A.cylinder(cx, cy, r, z, h, { name: id }))
  put(piece, obj, [cx, cy, z + h / 2], M(mat, S(k.cylinder(cx, cy, r, z, h, P, steps, bevel), { tone, crease, inner })) + extra, { bias, shapes: [shape], name: id })
  return id
}
function ext(piece, name, ring, z, h, mat, { bevel = 0, convex = true, tone = 'hi', crease = 'faint', inner = '', extra = '', obj, bias = 0 } = {}) {
  const id = named(piece, name)
  const shape = rec(A.extruded(ring, z, h, { name: id }))
  const cx = ring.reduce((s, p) => s + p[0], 0) / ring.length
  const cy = ring.reduce((s, p) => s + p[1], 0) / ring.length
  put(piece, obj, [cx, cy, z + h / 2], M(mat, S(k.extrude(ring, z, h, P, { bevel, convex }), { tone, crease, inner })) + extra, { bias, shapes: [shape], name: id })
  return id
}
function prism(piece, name, F, polygon, s0, s1, mat, { tone = 'hi', crease = 'faint', inner = '', extra = '', obj, bias = 0 } = {}) {
  const id = named(piece, name)
  const shape = rec(A.prism(F, polygon, s0, s1, { name: id }))
  const c = polygon.reduce((s, p) => [s[0] + p[0] / polygon.length, s[1] + p[1] / polygon.length], [0, 0])
  const centre = G.add3(G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), G.add3(G.mul3(F.u, c[0]), G.mul3(F.v, c[1])))
  put(piece, obj, centre, M(mat, S(G.prismOf(F, polygon, s0, s1, P), { tone, crease, inner })) + extra, { bias, shapes: [shape], name: id })
  return id
}
function discAlong(piece, name, F, s0, s1, r, mat, { tone = 'hi', crease = 'faint', inner = '', extra = '', obj, bias = 0, bevel = 0 } = {}) {
  const id = named(piece, name)
  const shape = rec(A.disc(F, s0, s1, r, { name: id }))
  put(piece, obj, G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), M(mat, S(G.disc(s0, s1, r, F, P, { bevel }), { tone, crease, inner })) + extra, { bias, shapes: [shape], name: id })
  return id
}
function shapesOf(list) {
  return list.map((s) => {
    const meta = { name: s.name }
    if (s.kind === 'extruded') return rec(A.extruded(s.ring, s.z, s.h, meta))
    if (s.kind === 'disc') return rec(A.disc(s.F, s.s0, s.s1, s.r, meta))
    if (s.kind === 'cylinder') return rec(A.cylinder(s.cx, s.cy, s.r, s.z, s.h, meta))
    if (s.kind === 'solid') return rec(A.solid(s.F, s.profile, meta))
    if (s.kind === 'prism') return rec(A.prism(s.F, s.polygon, s.s0, s.s1, meta))
    throw new Error(s.kind)
  })
}
function cable(name, points, r, mat, { piece, obj, gaps = [], bend = 9, touch = ['stand.top', 'stand.mat'], maxLength = 26, free } = {}) {
  const route = routeOf(points, r, bend)
  const id = `${piece}.cable-${name}`
  R.route(id, route, r, { owner: id, limp: true, gaps, piece, touch, free })
  tubePieces(route, r, P, { maxLength, spacing: 1, gaps }).forEach((part, index) =>
    put(piece, obj, part.mid, M(mat, tubeSvg(part, { tone: 'mid' })), { name: `${id}:${index}`, route: id, chunk: index, shapes: [A.tube(part.points, part.radii)] }),
  )
  return route
}
// Engraved or printed labels, drawn in the plane of the face they sit on.
const label = (transform, text, size, anchor = 'middle') =>
  `<text class="iso-face-text bn-label" transform="${transform}" font-size="${size}" text-anchor="${anchor}">${text}</text>`
const onTopAt = (x, y, z) => k.topMatrix([x, y], z, P, 'x')
const onFront = (y) => k.sideMatrix([0, y], 0, P, 'left') // local (x, -z)
const onRight = (x) => k.sideMatrix([x, 0], 0, P, 'right') // local (-y, -z)
const flatRect = (x0, z0, x1, z1, r, steps = 4) => k.pathOf(k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, steps).map(([u, z]) => [u, -z]), true)
const topRect = (plan, z, steps = 4) => k.planOutline(plan, z, P, steps)

// ---- the bench ----------------------------------------------------------------
const B = 'stand'
const back = []
back.push(`<path class="iso-halo bn-floor-halo" d="${k.haloOf(k.insetPlan(TOP, -14), FLOOR, 2, P)}"/>`)

const LX = [TOP.x + LEG_INSET, TOP.x + TOP.w - LEG_INSET - LEG]
const LY = [TOP.y + LEG_INSET, TOP.y + TOP.d - LEG_INSET - LEG]
const LEG_Z = FLOOR + 6
const legs = LX.flatMap((x) => LY.map((y) => ({ x, y, w: LEG, d: LEG, r: 1.2 })))
for (const leg of legs) {
  const cx = leg.x + LEG / 2
  const cy = leg.y + LEG / 2
  cyl(B, 'pad', cx, cy, 7.4, FLOOR, 2.6, 'rubber', { tone: 'mid', steps: 32 })
  cyl(B, 'nut', cx, cy, 5.2, FLOOR + 2.6, 3.4, 'steel', { tone: 'mid', steps: 6 })
  const bolts = [-25].map((z) => at([leg.x + LEG / 2, leg.y + LEG, z]))
  const seam = k.sideSeam(leg, LEG_Z + 6, P, 2)
  box(B, 'leg', leg, LEG_Z, -TOP_H - LEG_Z, 'frame', { steps: 2, bevel: 0.6, inner: Ln(seam, { tone: 'faint' }), extra: M('frame', Dt(bolts, { size: 0.55, tone: 'mid' })) })
}
const RAIL_X = { x: LX[0] + LEG, w: LX[1] - LX[0] - LEG }
const RAIL_Y = { y: LY[0] + LEG, d: LY[1] - LY[0] - LEG }
const rails = [
  { x: RAIL_X.x, y: LY[0] + 2, w: RAIL_X.w, d: LEG - 4, r: 1 },
  { x: RAIL_X.x, y: LY[1] + 2, w: RAIL_X.w, d: LEG - 4, r: 1 },
  { x: LX[0] + 2, y: RAIL_Y.y, w: LEG - 4, d: RAIL_Y.d, r: 1 },
  { x: LX[1] + 2, y: RAIL_Y.y, w: LEG - 4, d: RAIL_Y.d, r: 1 },
]
for (const plan of rails) {
  const along = plan.w > plan.d
  const holes = along
    ? Array.from({ length: 9 }, (_, i) => at([plan.x + 24 + i * ((plan.w - 48) / 8), plan.y + plan.d, -25]))
    : Array.from({ length: 4 }, (_, i) => at([plan.x + plan.w, plan.y + 24 + i * ((plan.d - 48) / 3), -25]))
  box(B, 'apron', plan, -34, 18, 'frame', { steps: 2, bevel: 0.5, extra: M('frame', Dt(holes, { size: 0.5, tone: 'lo' })) })
}

// Bench top: butcher-block strips run along x; their glue lines cross the top
// and drop down the visible end face.
{
  const glue = []
  for (let y = TOP.y + 25; y < TOP.y + TOP.d - 5; y += 25) glue.push(k.pathOf([at([TOP.x, y, 0]), at([TOP.x + TOP.w, y, 0]), at([TOP.x + TOP.w, y, -TOP_H])]))
  const dogs = [-160, 112, 214].map((x) => [x, TOP.y + 10])
  const dogRings = dogs.map(([x, y]) => k.ring(x, y, 3, 0, P, 24)).join('')
  const dogHoles = dogs.map(([x, y]) => `<path class="bn-hole" d="${k.ring(x, y, 3, 0, P, 24)}"/>`).join('')
  put(B, null, [0, 0, -TOP_H / 2], M('oak', S(k.slabOf(TOP, -TOP_H, TOP_H, P, 4, 1.4), { tone: 'hi', inner: Ln(k.sideSeam(TOP, -TOP_H + 4, P, 4), { tone: 'faint' }) }) + Ln(glue.join(''), { tone: 'faint' }) + dogHoles + Ln(dogRings, { tone: 'lo' })), {
    name: 'stand.top',
    shapes: [rec(A.slab(TOP, -TOP_H, TOP_H, { name: 'stand.top' }, 4))],
  })
}
// steel rule let into the front edge
{
  const RULE = { x: -205, y: TOP.y + TOP.d - 11, w: 410, d: 6.5, r: 0.8 }
  const t = k.topTicks(RULE.x + 4, RULE.x + RULE.w - 4, 5, 5, RULE.y, 0.4, [2.2, 4.4], P)
  box(B, 'rule', RULE, 0, 0.4, 'steel', { steps: 2, crease: 'none', tone: 'mid', extra: M('steel', Ln(t.minor, { tone: 'lo' }) + Ln(t.major, { tone: 'lo' })) })
}
// self-healing cutting mat with its grid and a 45° line
{
  const lines = []
  const major = []
  for (let x = MAT.x + 10; x < MAT.x + MAT.w - 1; x += 10) ((x - MAT.x) % 50 === 0 ? major : lines).push(k.lineOnTop([x, MAT.y], [x, MAT.y + MAT.d], 0.8, P))
  for (let y = MAT.y + 10; y < MAT.y + MAT.d - 1; y += 10) ((y - MAT.y) % 50 === 0 ? major : lines).push(k.lineOnTop([MAT.x, y], [MAT.x + MAT.w, y], 0.8, P))
  const diag = k.lineOnTop([MAT.x, MAT.y + MAT.d - 4], [MAT.x + MAT.d - 4, MAT.y], 0.8, P)
  box(B, 'mat', MAT, 0, 0.8, 'matgreen', { steps: 3, crease: 'lo', tone: 'mid', extra: M('matgreen', Ln(lines.join(''), { tone: 'faint' }) + Ln(major.join('') + diag, { tone: 'mid' })) })
}

// ---- power strip ----------------------------------------------------------------
const SP = 'strip'
{
  const face = STRIP.y + STRIP.d
  const sockets = SOCKETS.map((x) => flatRect(x - 7, 1.6, x + 7, 9.4, 1.6)).join('')
  const screws = [at([STRIP.x + 5, STRIP.y + STRIP.d / 2, STRIP_H]), at([STRIP.x + STRIP.w - 16, STRIP.y + STRIP.d / 2, STRIP_H])]
  box(SP, 'body', STRIP, 0, STRIP_H, 'white', {
    steps: 4,
    bevel: 0.6,
    inner: Ln(k.sideSeam(STRIP, 3, P, 4), { tone: 'faint' }),
    extra: M('white', `<g transform="${onFront(face)}"><path class="bn-hole" d="${sockets}"/>${Ln(sockets, { tone: 'lo' })}</g>` + Dt(screws, { size: 0.5, tone: 'lo' })),
  })
  for (const x of SOCKETS) box(SP, 'plug', { x: x - 5, y: face, w: 10, d: 8, r: 1.5 }, 2, 7, 'black', { steps: 3, bevel: 0.3, inner: Ln(k.sideSeam({ x: x - 5, y: face, w: 10, d: 8, r: 1.5 }, 4, P, 3), { tone: 'faint' }) })
  box(SP, 'plug', { x: STRIP.x + STRIP.w, y: -101.5, w: 8, d: 8, r: 1.5 }, 2, 7, 'black', { steps: 3, bevel: 0.3 })
  box(SP, 'rocker', { x: STRIP.x + STRIP.w - 13, y: STRIP.y + 4, w: 10, d: 12, r: 1.5 }, STRIP_H, 2.4, 'ember', { steps: 3, bevel: 0.4, extra: M('ledred', Dt([at([STRIP.x + STRIP.w - 20, STRIP.y + STRIP.d / 2, STRIP_H])], { size: 0.8, tone: 'hi' })) })
  // mains cord: out of the back, over the edge, down to a floor socket
  const mx = STRIP.x + 12
  box(B, 'wallplug', { x: mx - 6, y: TOP.y - 10, w: 12, d: 12, r: 2 }, FLOOR, 6, 'white', { steps: 3 })
  cable('mains', [[mx, STRIP.y, 5.5], [mx, TOP.y - 4, 5.5], [mx, TOP.y - 4, FLOOR + 6]], 1.6, 'cable', { piece: SP, bend: 8 })
}

// ---- cables from the strip ----------------------------------------------------------
function clip(piece, x, y, r, mat = 'white') {
  // adhesive cable clip: a block the cable passes through, with a screw
  box(piece, 'clip', { x: x - 2, y: y - r - 1.6, w: 4, d: 2 * r + 3.2, r: 1 }, 0, 2 * r + 0.8, mat, { steps: 3, bevel: 0.3, extra: M(mat, Dt([at([x, y, 2 * r + 0.8])], { size: 0.45, tone: 'lo' })) })
}
for (const [name, c] of Object.entries(CABLES)) {
  const route = routeOf(c.points, c.r, c.bend)
  if (c.clip) {
    cable(name, c.points, c.r, c.mat, { piece: SP, obj: c.piece, bend: c.bend })
    const end = route[route.length - 1]
    clip(SP, end[0] + 2 * c.clip, end[1], c.r)
    // the tail, re-drawn when its board lifts
    const tail = tailRoute(name, 0)
    const id = `${c.piece}.tail-${name}`
    R.route(id, tail, c.r, { owner: id, limp: true, piece: c.piece, touch: ['stand.top', 'stand.mat'] })
    const piece = tubePieces(tail, c.r, P, { maxLength: 400, spacing: 1, caps: [false, true] })[0]
    put(c.piece, c.piece, piece.mid, tailSvg(name, 0), { name: id, live: `tail:${name}`, shapes: [A.tube(piece.points, piece.radii)] })
  } else {
    cable(name, c.points, c.r, c.mat, { piece: SP, obj: c.piece === 'strip' ? 'cctv' : c.piece === 'dock' ? 'vector' : c.piece, bend: c.bend })
  }
}

// ---- Jetson Xavier NX developer kit -------------------------------------------------
{
  const J = 'jetson'
  const c = JETSON
  for (const [x, y] of k.corners(c, 5)) cyl(J, 'foot', x, y, 2.6, 0, 3, 'rubber', { tone: 'mid', steps: 16 })
  const holes = k.corners(c, 4)
  box(J, 'carrier', c, 3, 1.6, 'pcbblack', { steps: 3, bevel: 0.3, extra: M('pcbblack', Ln(holes.map(([x, y]) => k.ring(x, y, 1.8, 4.6, P, 16)).join(''), { tone: 'mid' }) + Dt(holes.map(([x, y]) => at([x, y, 4.6])), { size: 0.5, tone: 'mid' })) })
  const SOM = { x: c.x + 5, y: c.y + 6, w: 54, d: 56, r: 1 }
  box(J, 'module', SOM, 4.6, 1.6, 'pcbgreen', { steps: 2, bevel: 0.2 })
  const HS = { x: c.x + 7, y: c.y + 8, w: 48, d: 52, r: 2 }
  const hsTop = 24
  const fan = [HS.x + HS.w / 2, HS.y + 25]
  const FAN_R = 17.5
  const slotsY = Array.from({ length: 13 }, (_, i) => flatRect(HS.x + 3 + i * 3.4, 8, HS.x + 4.4 + i * 3.4, 21.5, 0.7, 3)).join('')
  const slotsX = Array.from({ length: 14 }, (_, i) => {
    const y = HS.y + 4 + i * 3.4
    return flatRect(-(y + 1.4), 8, -y, 21.5, 0.7, 3)
  }).join('')
  const well = k.ring(fan[0], fan[1], FAN_R, hsTop, P, 64)
  const blades = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2
    const p = (r, t) => [r * Math.cos(a + t), r * Math.sin(a + t)]
    const pts = [p(5.6, 0), p(10, 0.18), p(16.2, 0.42), p(16.2, 0.72), p(10, 0.56), p(5.6, 0.38)]
    return 'M' + pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L') + 'Z'
  }).join('')
  const fanSvg =
    `<path class="bn-hole" d="${well}"/>` +
    `<g transform="${onTopAt(fan[0], fan[1], hsTop)}"><g data-spin="fan"><path class="bn-blade" d="${blades}"/></g>` +
    `<circle class="bn-hub" r="5.6"/><circle class="bn-hub-ring" r="3.4"/></g>` +
    Ln(well, { tone: 'mid' }) +
    Ln(k.ring(fan[0], fan[1], FAN_R + 1.6, hsTop, P, 64), { tone: 'faint' }) +
    Dt(k.corners(HS, 4).map(([x, y]) => at([x, y, hsTop])), { size: 0.55, tone: 'mid' })
  box(J, 'heatsink', HS, 6.2, hsTop - 6.2, 'heatsink', {
    steps: 4,
    bevel: 0.8,
    extra: M('heatsink', `<g transform="${onFront(HS.y + HS.d)}">${Ln(slotsY, { tone: 'lo' })}</g><g transform="${onRight(HS.x + HS.w)}">${Ln(slotsX, { tone: 'lo' })}</g>` + fanSvg + label(onTopAt(HS.x + HS.w / 2, HS.y + HS.d - 3.2, hsTop), 'JETSON', 4.4)),
  })
  // ports along the right edge, facing the strip
  const px = c.x + c.w
  const usb = (y) => {
    const plan = { x: px - 15, y, w: 15.6, d: 12, r: 0.6 }
    const slots = [7.5, 13].map((z) => flatRect(-(y + 10.5), z, -(y + 1.5), z + 3.2, 0.4, 2)).join('')
    box(J, 'usb', plan, 4.6, 14, 'steel', { steps: 2, bevel: 0.3, extra: M('steel', `<g transform="${onRight(px + 0.6)}"><path class="bn-hole" d="${slots}"/>${Ln(slots, { tone: 'lo' })}</g>`) })
  }
  usb(c.y + 4)
  usb(c.y + 18)
  {
    const plan = { x: px - 17, y: c.y + 32, w: 17.6, d: 14, r: 0.6 }
    const jack = flatRect(-(plan.y + 11.5), 6, -(plan.y + 2.5), 13, 0.6, 2)
    box(J, 'ethernet', plan, 4.6, 13, 'steel', { steps: 2, bevel: 0.3, extra: M('steel', `<g transform="${onRight(px + 0.6)}"><path class="bn-hole" d="${jack}"/>${Ln(jack, { tone: 'lo' })}</g>`) + M('ledgreen', Dt([at([px + 0.6, plan.y + 3, 15.5])], { size: 0.6, tone: 'hi' })) + M('gold', Dt([at([px + 0.6, plan.y + 11, 15.5])], { size: 0.6, tone: 'hi' })) })
  }
  {
    const plan = { x: px - 11, y: c.y + 49, w: 11.4, d: 9, r: 0.6 }
    const slot = flatRect(-(plan.y + 7.5), 6.6, -(plan.y + 1.5), 8.8, 0.4, 2)
    box(J, 'hdmi', plan, 4.6, 5.2, 'steel', { steps: 2, extra: M('steel', `<g transform="${onRight(px + 0.4)}"><path class="bn-hole" d="${slot}"/></g>`) })
  }
  {
    const plan = { x: px - 11, y: c.y + 59, w: 12, d: 9, r: 0.8 }
    box(J, 'dcjack', plan, 4.6, 8.4, 'black', { steps: 2, bevel: 0.3 })
  }
  // 40-pin header along the front edge
  {
    const plan = { x: c.x + 8, y: c.y + c.d - 7, w: 44, d: 5, r: 0.5 }
    const pins = []
    for (let i = 0; i < 20; i++) for (let j = 0; j < 2; j++) pins.push(at([plan.x + 1.3 + i * 2.18, plan.y + 1.4 + j * 2.2, 8.6]))
    box(J, 'header', plan, 4.6, 4, 'black', { steps: 2, extra: M('gold', Dt(pins, { size: 0.42, tone: 'hi' })) })
  }
}

// ---- Vector and his charger ---------------------------------------------------------
{
  const D = 'dock'
  const d = DOCK
  box(D, 'base', d, 0, 6, 'black', { steps: 5, bevel: 0.5, obj: 'vector', extra: M('black', label(`${onFront(d.y + d.d)} translate(${d.x + d.w / 2} -1.5)`, 'VECTOR', 3.5)) })
  box(D, 'riser', { x: d.x + 4, y: d.y + 1, w: d.w - 8, d: 9, r: 2 }, 6, 6, 'black', { steps: 3, bevel: 0.4, obj: 'vector' })
  const pads = [d.x + 9, d.x + d.w - 13].map((x) => ({ x, y: d.y + 12, w: 4, d: 7, r: 0.8 }))
  for (const plan of pads) box(D, 'contact', plan, 6, 0.4, 'gold', { steps: 2, crease: 'none', tone: 'mid', obj: 'vector' })
}
{
  const VC = 'vector'
  const { cx, cy } = VECTOR
  // tracks: stadium side profiles extruded across the robot
  for (const [x0, outer] of [[cx - 19, false], [cx + 12, true]]) {
    const F = G.frameOf([x0, cy - 15, 6], [1, 0, 0], [0, 1, 0], [0, 0, 1])
    const tread = []
    if (outer) for (let y = cy - 14; y <= cy + 14; y += 2.8) tread.push(k.pathOf([at([x0, y, 12]), at([x0 + 7, y, 12])]))
    const hubs = outer ? [cy - 15, cy + 15].map((y) => k.sideRing([x0 + 7, y, 6], 3.8, 'x', P, 24)).join('') + k.sideRing([x0 + 7, cy, 7], 2.4, 'x', P, 18) : ''
    prism(VC, 'track', F, G.stadium(6, 6, 30, 28), 0, 7, 'rubber', { tone: 'mid', extra: M('rubber', Ln(tread.join(''), { tone: 'lo' }) + Ln(hubs, { tone: 'mid' })) })
  }
  const BODY = { x: cx - 12, y: cy - 20, w: 24, d: 36, r: 5 }
  box(VC, 'body', BODY, 5, 23, 'charcoal', { steps: 5, bevel: 0.6, inner: Ln(k.sideSeam(BODY, 12, P, 5), { tone: 'faint' }) })
  // backpack light
  const PACK = { x: cx - 4, y: cy - 18, w: 8, d: 10, r: 2.4 }
  box(VC, 'backpack', PACK, 28, 1.4, 'black', { steps: 3, extra: M('ledgreen', Dt([0, 1, 2].map((i) => at([cx, PACK.y + 2.4 + i * 2.6, 29.4])), { size: 0.75, tone: 'hi' })) })
  // head with the face screen on its front
  const HEAD = { x: cx - 13, y: cy - 6, w: 26, d: 24, r: 5 }
  const fy = HEAD.y + HEAD.d
  const screen = flatRect(cx - 10, 30.5, cx + 10, 40.5, 2.2, 4)
  const eye = (x) => flatRect(x - 3, 32.6, x + 3, 38.4, 1.7, 4)
  const face =
    `<g transform="${onFront(fy)}"><path class="bn-screen" d="${screen}"/>` +
    `<g class="bn-eyes" data-eyes="" style="transform-origin:${cx}px ${-35.5}px"><path class="bn-eye" d="${eye(cx - 4.8) + eye(cx + 4.8)}"/></g>` +
    `<path class="iso-line" data-tone="lo" d="${screen}"/></g>`
  box(VC, 'head', HEAD, 28, 14, 'charcoal2', { steps: 5, bevel: 0.6, extra: M('charcoal2', face + Dt([at([cx, fy, 29.4])], { size: 0.5, tone: 'mid' })) })
  // lift: pivot hubs on the body, two arms outside the tracks, a fork bar in front
  for (const side of [-1, 1]) {
    const hx = side < 0 ? cx - 19.5 : cx + 12
    const F = G.frameOf([hx, cy - 10, 24], [1, 0, 0], [0, 1, 0], [0, 0, 1])
    discAlong(VC, 'pivot', F, 0, 7.5, 3, 'charcoal', { tone: 'mid' })
    const ax = side < 0 ? cx - 22 : cx + 19.5
    const AF = G.frameOf([ax, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1])
    const a = [cy - 10, 24]
    const b = [cy + 23, 9]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    const n = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len]
    const t = 2.6
    const poly = [[a[0] + n[0] * t, a[1] + n[1] * t], [b[0] + n[0] * t, b[1] + n[1] * t], [b[0] - n[0] * t, b[1] - n[1] * t], [a[0] - n[0] * t, a[1] - n[1] * t]]
    prism(VC, 'arm', AF, poly, 0, 2.5, 'charcoal2', { tone: 'hi' })
  }
  box(VC, 'fork', { x: cx - 22, y: cy + 24, w: 44, d: 4.5, r: 1.2 }, 6, 5, 'charcoal2', { steps: 2, bevel: 0.4 })
}

// ---- Noir (Moorebot Scout) ---------------------------------------------------------------
{
  const N = 'noir'
  const { cx, cy } = NOIR
  const Z = 0.8
  const CH = { x: cx - 24, y: cy - 15, w: 46, d: 30, r: 4 }
  const nose = flatRect(-(cy + 8), 12 + Z, -(cy - 8), 19 + Z, 2, 4)
  box(N, 'chassis', CH, 6 + Z, 18, 'noir', {
    steps: 4,
    bevel: 0.6,
    inner: Ln(k.sideSeam(CH, 10 + Z, P, 4), { tone: 'faint' }),
    extra: M('noir', `<g transform="${onRight(CH.x + CH.w)}"><path class="bn-screen" d="${nose}"/>${Ln(nose, { tone: 'mid' })}</g>` + label(`${onFront(CH.y + CH.d)} translate(${cx - 1} ${-18.8 - Z})`, 'NOIR', 4.4)) + M('white', Dt([at([CH.x + CH.w, cy - 11, 9 + Z]), at([CH.x + CH.w, cy + 11, 9 + Z])], { size: 0.8, tone: 'hi' })),
  })
  box(N, 'cover', { x: cx - 21, y: cy - 12, w: 40, d: 24, r: 3 }, 24 + Z, 2.5, 'noir2', { steps: 3, bevel: 0.4 })
  cyl(N, 'turret-base', TURRET.x, TURRET.y, 7.2, 26.5 + Z, 2, 'steeldark', { tone: 'mid', steps: 32 })
  // mecanum wheels: rollers are helical ribs round each rim
  for (const wx of [cx - 13, cx + 11]) {
    for (const [y0, sgn] of [[CH.y + CH.d, 1], [CH.y, -1]]) {
      const F = G.frameOf([wx, y0, 8.5 + Z], [0, sgn, 0], [1, 0, 0], [0, 0, 1])
      const ribs = sgn > 0 ? k.fadedSvg(G.ribsOf(F, 0.5, 6.5, 8.5, 14, P, { twist: 0.7, fade: [0.05, 0.5], seams: true }), { tone: 'mid' }) : ''
      const hub = sgn > 0 ? M('steel', S(G.disc(7, 7.8, 3.6, F, P), { tone: 'mid' }) + Dt([at(G.pointOf(F, 7.8, 0, 0))], { size: 0.5, tone: 'hi' })) : ''
      const id = named(N, 'wheel')
      put(N, N, G.pointOf(F, 3.5, 0, 0), M('rubber', S(G.disc(0, 7, 8.5, F, P), { tone: 'mid' }) + ribs) + hub, { name: id, shapes: [rec(A.disc(F, 0, 7.8, 8.5, { name: id }))] })
    }
  }
  const t = turretAt(TURRET.rest)
  put(N, N, t.mid, t.svg, { name: 'noir.turret', live: 'turret', shapes: shapesOf(t.solids) })
}

// ---- the mug on its coaster ----------------------------------------------------------------
{
  const Mg = 'mug'
  const { cx, cy, r } = MUG
  const COASTER = { x: cx - 19, y: cy - 19, w: 38, d: 38, r: 5 }
  box('coaster', 'slate', COASTER, 0.8, 2.2, 'slate', { steps: 5, bevel: 0.5, obj: Mg, extra: M('slate', label(`${onTopAt(cx, cy + r + 4.8, 3)}`, 'MUG', 4)) })
  const z0 = 3
  const z1 = 31
  const inner = r - 1.6
  const clipId = 'bn-mug-clip'
  const coffee = `<clipPath id="${clipId}"><path d="${k.ring(cx, cy, inner, z1, P, 64)}"/></clipPath>` +
    `<path class="bn-mug-in" d="${k.ring(cx, cy, inner, z1, P, 64)}"/>` +
    `<g clip-path="url(#${clipId})"><path class="bn-coffee" d="${k.ring(cx, cy, inner, z1 - 4, P, 64)}"/></g>` +
    Ln(k.ring(cx, cy, inner, z1, P, 64), { tone: 'lo' })
  const id = named(Mg, 'body')
  put(Mg, Mg, [cx, cy, (z0 + z1) / 2], M('mustard', S(k.cylinder(cx, cy, r, z0, z1 - z0, P, 64, 0.5), { tone: 'hi', inner: Ln(k.sideArc(cx, cy, r, z0 + 3, P, 40), { tone: 'faint' }) }) + coffee), { name: id, shapes: [rec(A.cylinder(cx, cy, r, z0, z1 - z0, { name: id }))] })
  const hr = 1.9
  const x0 = cx + Math.sqrt(r * r - hr * hr) + 0.1
  const arc = Array.from({ length: 29 }, (_, i) => {
    const t = Math.PI / 2 - (i / 28) * Math.PI
    return [x0 + 0.8 + 9 * Math.cos(t), cy, 18.25 + 7.75 * Math.sin(t)]
  })
  const handle = [[x0, cy, 26], ...arc, [x0, cy, 10.5]]
  const hid = 'mug.handle'
  R.route(hid, handle, hr, { owner: hid, piece: Mg })
  tubePieces(handle, hr, P, { maxLength: 60, spacing: 1 }).forEach((part, i) => put(Mg, Mg, part.mid, M('mustard', tubeSvg(part, { tone: 'hi' })), { name: `${hid}:${i}`, route: hid, chunk: i, shapes: [A.tube(part.points, part.radii)] }))
}

// ---- the 1:64 car on its plinth ----------------------------------------------------------------
{
  const Cp = 'car'
  const { cx, cy } = CAR
  const BASE = { x: cx - 26, y: cy - 12, w: 52, d: 24, r: 2 }
  box('plinth', 'base', BASE, 0.8, 6, 'plinth', { steps: 3, bevel: 0.5, obj: Cp, extra: M('plinth', label(`${onFront(BASE.y + BASE.d)} translate(${cx} -2.4)`, '1:64', 3.8)) })
  const z = 6.8
  const x0 = cx - 23
  const yb = cy - 9
  const F = G.frameOf([x0, yb, z], [0, 1, 0], [1, 0, 0], [0, 0, 1])
  // wheels first (far side), body, then near wheels
  const wheel = (wx, near) => {
    const y = near ? yb + 18 : yb
    const WF = G.frameOf([wx, y, z + 4.2], [0, near ? 1 : -1, 0], [1, 0, 0], [0, 0, 1])
    const id = named(Cp, 'wheel')
    const rim = near ? M('steel', S(G.disc(2.2, 2.6, 2.7, WF, P), { tone: 'mid' }) + Dt(G.dotsOf(WF, 2.6, 1.6, 5, P, { all: true }), { size: 0.35, tone: 'lo' })) : ''
    put(Cp, Cp, G.pointOf(WF, 1.2, 0, 0), M('rubber', S(G.disc(0, 2.2, 4.2, WF, P), { tone: 'mid' })) + rim, { name: id, shapes: [rec(A.disc(WF, 0, 2.6, 4.2, { name: id }))] })
  }
  for (const wx of [x0 + 9, x0 + 37]) wheel(wx, false)
  const bodyPoly = [[0, 3.6], [2, 2], [44, 2], [46, 3.6], [46, 6], [43, 8], [30, 9.5], [4, 10], [0, 8.6]]
  const door = k.pathOf([at([x0 + 21, yb + 18, z + 2]), at([x0 + 21, yb + 18, z + 9.7])])
  prism(Cp, 'body', F, bodyPoly, 0, 18, 'pink', { tone: 'hi', inner: Ln(door, { tone: 'lo' }) })
  const CF = G.frameOf([x0, yb + 2, z], [0, 1, 0], [1, 0, 0], [0, 0, 1])
  prism(Cp, 'cabin', CF, [[12, 9.85], [19, 14.6], [28, 14.9], [33, 9.15]], 0, 14, 'cabin', { tone: 'mid' })
  box(Cp, 'spoiler', { x: x0 + 0.5, y: yb + 1, w: 5, d: 16, r: 0.8 }, z + 11.4, 1.1, 'pink', { steps: 2 })
  for (const y of [yb + 4, yb + 12.4]) box(Cp, 'strut', { x: x0 + 2.2, y, w: 1.6, d: 1.6, r: 0.3 }, z + 9.9, 1.5, 'pink', { steps: 1, crease: 'none' })
  for (const wx of [x0 + 9, x0 + 37]) wheel(wx, true)
}

// ---- Tello ---------------------------------------------------------------------------------
{
  const T = 'tello'
  const { cx, cy } = TELLO
  const motors = [[-32, -30], [32, -30], [-32, 30], [32, 30]].map(([dx, dy]) => [cx + dx, cy + dy])
  const byDepth = (list) => [...list].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))
  // arms: thin bars from the body to each motor
  for (const [mx, my] of motors) {
    const dx = mx - cx
    const dy = my - cy
    const len = Math.hypot(dx, dy)
    const u = [dx / len, dy / len]
    const n = [-u[1] * 2, u[0] * 2]
    const sink = (t) => Math.max(...[-1, 0, 1].map((side) => {
      // how far a point on the arm's start edge lies inside the body plan
      const px = Math.abs(u[0] * t - u[1] * 2 * side)
      const py = Math.abs(u[1] * t + u[0] * 2 * side)
      const qx = px - 5
      const qy = py - 12
      const outside = qx > 0 && qy > 0 ? Math.hypot(qx, qy) - 8 : Math.max(px - 13, py - 20)
      return -outside
    }))
    let t0 = 0
    while (sink(t0) > 0.3) t0 += 0.05
    const a = [cx + u[0] * t0, cy + u[1] * t0]
    const b = [mx - u[0] * 4.6, my - u[1] * 4.6]
    ext(T, 'arm', [[a[0] + n[0], a[1] + n[1]], [b[0] + n[0], b[1] + n[1]], [b[0] - n[0], b[1] - n[1]], [a[0] - n[0], a[1] - n[1]]], 8, 3.4, 'grey', { tone: 'mid' })
  }
  for (const [mx, my] of byDepth(motors)) {
    cyl(T, 'foot', mx, my, 3.6, 0, 4, 'rubber', { tone: 'mid', steps: 20 })
    cyl(T, 'mount', mx, my, 5, 4, 8.5, 'grey', { tone: 'mid', steps: 28, bevel: 0.3, inner: Ln(k.sideArc(mx, my, 5, 9, P, 24), { tone: 'faint' }) })
    cyl(T, 'bell', mx, my, 4.2, 12.5, 4.5, 'steeldark', { tone: 'mid', steps: 24, extra: M('steeldark', Ln(k.knurl(mx, my, 4.2, 12.5, 17, 18, P), { tone: 'lo' })) })
    cyl(T, 'hub', mx, my, 1.8, 17, 2, 'grey', { tone: 'mid', steps: 14 })
  }
  box(T, 'battery', { x: cx - 11, y: cy - 29, w: 22, d: 9, r: 2.5 }, 6, 10, 'grey', { steps: 3, bevel: 0.4 })
  const BODY = { x: cx - 13, y: cy - 20, w: 26, d: 40, r: 8 }
  box(T, 'belly', k.insetPlan(BODY, 1), 3, 3, 'grey', { steps: 6, tone: 'mid' })
  const cam = flatRect(cx - 4.5, 8.5, cx + 4.5, 15, 2, 4)
  box(T, 'body', BODY, 6, 13, 'white', {
    steps: 6,
    bevel: 0.9,
    inner: Ln(k.sideSeam(BODY, 9, P, 6), { tone: 'faint' }),
    extra: M('white', `<g transform="${onFront(BODY.y + BODY.d)}"><path class="bn-screen" d="${cam}"/>${Ln(cam, { tone: 'lo' })}</g>` + label(onTopAt(cx, cy + 9, 19), 'TELLO', 4.6) + Ln(k.planOutline(k.insetPlan(BODY, 3), 19, P, 6), { tone: 'faint' })) +
      M('glass', Dt([at([cx, BODY.y + BODY.d, 11.8])], { size: 1.3, tone: 'mid' })),
  })
  // props: two blades in the plane above each motor, spun in the page
  motors.forEach(([mx, my], i) => {
    const blade = (s) => `M${2 * s} -1.3C${8 * s} -2.6 ${16 * s} -2.4 ${20.5 * s} -0.6Q${21.2 * s} 0.4 ${20 * s} 0.9C${14 * s} 1.6 ${7 * s} 1.6 ${2 * s} 1.3Z`
    const svg = `<g transform="${onTopAt(mx, my, 19)}"><g data-spin="prop${i}" data-dir="${i % 3 === 0 ? 1 : -1}"><path class="bn-blade bn-prop" d="${blade(1)}${blade(-1)}"/></g><circle class="bn-hub" r="2"/></g>`
    const id = `tello.prop${i}`
    put(T, T, [mx, my, 19.2], M('grey', svg), { name: id, shapes: [rec(A.cylinder(mx, my, 20.5, 19, 0.3, { name: id }))] })
  })
}

// ---- game controller ---------------------------------------------------------------------------
{
  const Pd = 'pad'
  const { cx, cy } = PAD_AT
  const raw = [[-30, -14], [30, -14], [34, -10], [36, -2], [36, 10], [34, 19], [30, 23], [24, 23], [20, 19], [16, 10], [8, 8], [-8, 8], [-16, 10], [-20, 19], [-24, 23], [-30, 23], [-34, 19], [-36, 10], [-36, -2], [-34, -10]]
  let ring = raw
  for (let pass = 0; pass < 2; pass++) ring = ring.flatMap((p, i) => { const q = ring[(i + 1) % ring.length]; return [[p[0] * 0.75 + q[0] * 0.25, p[1] * 0.75 + q[1] * 0.25], [p[0] * 0.25 + q[0] * 0.75, p[1] * 0.25 + q[1] * 0.75]] })
  const place = (pts, s = 1) => pts.map(([x, y]) => [cx + x * s, cy + y * s])
  for (const x of [-20, 20]) box(Pd, 'trigger', { x: cx + x - 6, y: cy - 18.6, w: 12, d: 5, r: 2 }, 5, 6, 'black', { steps: 3, bevel: 0.3 })
  ext(Pd, 'shell', place(ring, 0.97), 0, 3, 'black', { convex: false, tone: 'mid' })
  const TP = { x: cx - 12, y: cy - 12, w: 24, d: 12, r: 2 }
  ext(Pd, 'body', place(ring), 3, 10, 'white', { convex: false, bevel: 0.6, extra: M('white', Ln(topRect(TP, 13), { tone: 'lo' }) + label(onTopAt(cx, cy - 4.6, 13), 'PAD', 4.2) + Dt([at([cx - 16, cy - 9, 13]), at([cx + 16, cy - 9, 13]), at([cx, cy + 5, 13])], { size: 0.7, tone: 'mid' })) })
  // d-pad and face buttons
  const cross = [[-1.6, -5], [1.6, -5], [1.6, -1.6], [5, -1.6], [5, 1.6], [1.6, 1.6], [1.6, 5], [-1.6, 5], [-1.6, 1.6], [-5, 1.6], [-5, -1.6], [-1.6, -1.6]]
  ext(Pd, 'dpad', place(cross).map(([x, y]) => [x - 24, y - 1]), 13, 1.4, 'black', { convex: false, tone: 'mid' })
  const fb = [[0, -4], [-4, 0], [4, 0], [0, 4]]
  for (const [dx, dy] of fb.sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))) cyl(Pd, 'button', cx + 24 + dx, cy - 1 + dy, 1.7, 13, 1.4, 'black', { tone: 'mid', steps: 14 })
  for (const sx of [-12, 12]) {
    const x = cx + sx
    const y = cy + 6
    cyl(Pd, 'stick-ring', x, y, 5.6, 13, 1, 'black', { tone: 'mid', steps: 28 })
    cyl(Pd, 'stick', x, y, 4.4, 14, 3.6, 'black', { tone: 'mid', steps: 28, extra: M('black', Ln(k.ring(x, y, 2.8, 17.6, P, 24), { tone: 'mid' }) + Ln(k.knurl(x, y, 4.4, 14, 17.6, 22, P), { tone: 'faint' })) })
  }
}

// ---- Arduino UNO Q --------------------------------------------------------------------------------
{
  const U = 'unoq'
  const b = UNOQ
  for (const [x, y] of k.corners(b, 4)) cyl(U, 'standoff', x, y, 2.4, 0, 4, 'brass', { tone: 'mid', steps: 6 })
  // LED matrix 13 × 8 on the board, drawn in its plane
  const LED = { x: b.x + 32, y: b.y + 9, pitch: 2.6, cols: 13, rows: 8 }
  // at rest the matrix shows its checkmark, as the board does when a job is done
  const CHECK = new Set([[3, 4], [4, 5], [5, 6], [6, 5], [7, 4], [8, 3], [9, 2]].map(([c, r]) => r * LED.cols + c))
  const leds = []
  const glows = []
  for (let row = 0; row < LED.rows; row++)
    for (let col = 0; col < LED.cols; col++) {
      const i = row * LED.cols + col
      const lit = CHECK.has(i)
      const x = col * LED.pitch
      const y = row * LED.pitch
      glows.push(`<rect class="bn-glow" data-glow="${i}" fill-opacity="${lit ? 0.9 : 0}" x="${(x - 1.9).toFixed(2)}" y="${(y - 1.7).toFixed(2)}" width="3.8" height="3.4" rx="1.6"/>`)
      leds.push(`<rect class="bn-led" data-led="${i}" fill-opacity="${lit ? 1 : 0.14}" x="${(x - 0.8).toFixed(2)}" y="${(y - 0.65).toFixed(2)}" width="1.6" height="1.3" rx="0.3"/>`)
    }
  const holes = k.corners(b, 4)
  const silk = label(onTopAt(b.x + 34, b.y + b.d - 1.4, 5.6), 'UNO Q', 4.2)
  const frame = Ln(topRect({ x: LED.x - 2.2, y: LED.y - 2, w: (LED.cols - 1) * LED.pitch + 4.4, d: (LED.rows - 1) * LED.pitch + 4, r: 1 }, 5.6), { tone: 'faint' })
  box(U, 'board', b, 4, 1.6, 'pcbnavy', {
    steps: 3,
    bevel: 0.3,
    extra: M('pcbnavy', `<g transform="${onTopAt(LED.x, LED.y, 5.6)}"><g class="bn-glows">${glows.join('')}</g>${leds.join('')}</g>` + frame + silk + Ln(holes.map(([x, y]) => k.ring(x, y, 2.6, 5.6, P, 16)).join(''), { tone: 'mid' })) + M('ledgreen', Dt([at([b.x + 4, b.y + 25, 5.6])], { size: 0.65, tone: 'hi' })),
  })
  for (const y of [b.y + 1.2, b.y + b.d - 11]) {
    const plan = { x: b.x + 18, y, w: 46, d: 4.4, r: 0.5 }
    const pins = Array.from({ length: 18 }, (_, i) => at([plan.x + 1.6 + i * 2.54, plan.y + 2.2, 10.6]))
    box(U, 'header', plan, 5.6, 5, 'black', { steps: 2, extra: M('black', Dt(pins, { size: 0.42, tone: 'lo' })) })
  }
  box(U, 'soc', { x: b.x + 6, y: b.y + 8, w: 15, d: 15, r: 0.8 }, 5.6, 1.8, 'chip', { steps: 2, bevel: 0.2, extra: M('steel', Ln(topRect({ x: b.x + 8.5, y: b.y + 10.5, w: 10, d: 10, r: 0.6 }, 7.4), { tone: 'mid' })) })
  box(U, 'ram', { x: b.x + 6, y: b.y + 26, w: 11, d: 8, r: 0.6 }, 5.6, 1.4, 'chip', { steps: 2 })
  box(U, 'mcu', { x: b.x + 19, y: b.y + 26, w: 8, d: 8, r: 0.6 }, 5.6, 1.2, 'chip', { steps: 2, extra: M('chip', Dt([at([b.x + 20.4, b.y + 27.4, 6.8])], { size: 0.35, tone: 'mid' })) })
  box(U, 'usbc', { x: b.x - 3, y: b.y + 30, w: 8, d: 9, r: 2.2 }, 5.6, 3.4, 'steel', { steps: 3, bevel: 0.2 })
}

// ---- CCTV on a post ------------------------------------------------------------------------------
{
  const C = 'cctv'
  const [px, py] = CCTV.post
  const PLATE = { x: px - 13, y: py - 12, w: 30, d: 26, r: 3 }
  box(C, 'plate', PLATE, 0, 4, 'steeldark', { steps: 3, bevel: 0.5, extra: M('steeldark', Dt(k.corners(PLATE, 3.4).map(([x, y]) => at([x, y, 4])), { size: 0.55, tone: 'hi' }) + Ln(k.corners(PLATE, 3.4).map(([x, y]) => k.ring(x, y, 1.6, 4, P, 14)).join(''), { tone: 'lo' })) })
  const BOX = { x: px - 11, y: py - 8, w: 22, d: 16, r: 2 }
  box(C, 'junction', BOX, 4, 12, 'white', { steps: 3, bevel: 0.6, inner: Ln(k.sideSeam(BOX, 13, P, 3), { tone: 'faint' }), extra: M('white', label(`${onFront(BOX.y + BOX.d)} translate(${px} -7)`, 'CCTV', 4.6)) })
  cyl(C, 'post', px, py, 3.2, 16, CCTV.top - 16, 'white', { tone: 'hi', steps: 28, inner: Ln(k.sideArc(px, py, 3.2, 40, P, 24), { tone: 'faint' }) })
  cyl(C, 'pan-base', px, py, 5.4, CCTV.top, 4, 'white', { tone: 'hi', steps: 32, bevel: 0.3 })
  const h = cctvAt(CAM.rest)
  put(C, C, h.mid, h.svg, { name: 'cctv.head', live: 'cctv', shapes: shapesOf(h.solids) })
}

// ---- a screwdriver left on the top ------------------------
{
  const Tl = 'tools'
  const y = -64
  const F = G.frameAlong([104, y, 3.2], [1, 0, 0])
  const prof = [[0, 2.4], [0.8, 3.0, 1], [2, 3.2, 1], [17, 3.2], [19, 2.6, 1], [21, 2.2]]
  const knurl = k.fadedSvg(G.ribsOf(F, 2, 17, 3.2, 14, P, { fade: [0.1, 0.55], seams: true }), { tone: 'lo' })
  const id = named(Tl, 'handle')
  put(Tl, Tl, G.pointOf(F, 10, 0, 0), M('blue', S(G.solidOf(prof, F, P), { tone: 'hi', inner: knurl })), { name: id, shapes: [rec(A.solid(F, prof, { name: id }))] })
  discAlong(Tl, 'shaft', F, 21, 44, 0.85, 'steel', { tone: 'mid', crease: 'none' })
  discAlong(Tl, 'tip', F, 44, 45.6, 0.55, 'steel', { tone: 'mid', crease: 'none' })
}

// Each strip cable leaves a plug that stands on the strip's face: looked at 8×,
// the cable reads as plugged in, not threaded through the strip.
const CROWD_OK = [['strip.cable-*', 'strip.body']]

// ---- settle, write ------------------------------------------------------------------------------
A.settle(R, P)
const items = [...R.items].sort((a, b) => a.key - b.key)
const solids = R.solids.length
const OBJECTS = ['vector', 'noir', 'unoq', 'jetson', 'tello', 'pad', 'car', 'mug', 'cctv']
const data = {
  W,
  H,
  P,
  back: back.join(''),
  items: items.map((item) => ({ p: item.piece, o: item.obj, s: item.svg, ...(item.live ? { l: item.live } : {}) })),
  objects: OBJECTS,
  halos: Object.fromEntries(
    Object.entries({
      vector: [{ x: VECTOR.cx - 19, y: VECTOR.cy - 21, w: 38, d: 50, r: 6 }, 0],
      noir: [{ x: NOIR.cx - 24, y: NOIR.cy - 22, w: 46, d: 44, r: 6 }, 0.8],
      unoq: [UNOQ, 0],
      jetson: [JETSON, 0],
      tello: [{ x: TELLO.cx - 36, y: TELLO.cy - 34, w: 72, d: 68, r: 18 }, 0],
      pad: [{ x: PAD_AT.cx - 36, y: PAD_AT.cy - 14, w: 72, d: 37, r: 10 }, 0],
      car: [{ x: CAR.cx - 23, y: CAR.cy - 9, w: 46, d: 18, r: 4 }, 6.8],
      mug: [{ x: MUG.cx - MUG.r, y: MUG.cy - MUG.r, w: MUG.r * 2, d: MUG.r * 2, r: MUG.r }, 3],
    }).map(([piece, [plan, z]]) => [piece, k.haloOf(plan, z, 0.1, P)]),
  ),
  haloAfter: items.findIndex((item) => item.name === 'stand.mat'),
  // where each thing sits on screen, for the phone view that follows the selection
  centres: Object.fromEntries(
    Object.entries({
      vector: [VECTOR.cx - 15, VECTOR.cy, 20],
      noir: [NOIR.cx, NOIR.cy, 18],
      unoq: [UNOQ.x + UNOQ.w / 2, UNOQ.y + UNOQ.d / 2, 6],
      jetson: [JETSON.x + JETSON.w / 2, JETSON.y + JETSON.d / 2, 12],
      tello: [TELLO.cx, TELLO.cy, 12],
      pad: [PAD_AT.cx, PAD_AT.cy, 8],
      car: [CAR.cx, CAR.cy, 10],
      mug: [MUG.cx, MUG.cy, 16],
      cctv: [CCTV.post[0] - 6, CCTV.post[1] + 6, 40],
    }).map(([name, p]) => [name, at(p).map((v) => Math.round(v * 10) / 10)]),
  ),
  // the bench top on screen (no legs), which the phone view stays inside
  topBox: (() => {
    const pts = [...k.boxCorners(TOP, -TOP_H, 0), [CCTV.post[0], CCTV.post[1], 92]].map(at)
    const xs = pts.map(([x]) => x)
    const ys = pts.map(([, y]) => y)
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)].map((v) => Math.round(v))
  })(),
}
writeFileSync(join(HERE, 'bench.data.js'), `// Generated by build.mjs: do not edit.\nexport default ${JSON.stringify(data)}\n`)
writeFileSync(join(HERE, 'materials.gen.css'), `/* Generated by build.mjs */\n${materialCss()}\n`)
console.log(`wrote bench.data.js · ${items.length} items · ${solids} solids · ${R.routes.length} routes · ${(JSON.stringify(data).length / 1024).toFixed(0)} KB`)
A.auditOrExit(R, P, { crowd: CROWD_OK })

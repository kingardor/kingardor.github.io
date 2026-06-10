// Per-section poses for the monolith. `x`/`y` are normalized viewport coords
// (-1..1 = left..right / bottom..top edge at z=0); Monolith.jsx maps them to
// world units from the camera frustum. `t` is local progress within the
// section's scroll range (0 = section enters viewport bottom, 1 = leaves top).

const heroPose = {
  x: 0.55, y: 0.05, z: 0,
  scale: 0.62, stretchY: 2.4, noiseAmp: 0.04, twist: 0,
  shard: 0, ember: 0.15, facet: 0.85, rotSpeed: 0.05,
}

const manifestoPose = {
  x: 0.72, y: 0.05, z: 0.2,
  scale: 0.6, stretchY: 1.8, noiseAmp: 0.10, twist: 0.4,
  shard: 0, ember: 0.45, facet: 0.7, rotSpeed: 0.08,
}

const careerPose = {
  x: -0.62, y: 0, z: -0.5,
  scale: 0.5, stretchY: 3.2, noiseAmp: 0.06, twist: 0.15,
  shard: 0, ember: 0.25, facet: 0.9, rotSpeed: 0.04,
}

const skillsPose = {
  x: 0, y: 0.1, z: -0.8,
  scale: 0.5, stretchY: 1.0, noiseAmp: 0.18, twist: 0,
  shard: 1.0, ember: 0.6, facet: 0.6, rotSpeed: 0.12,
}

const projectsPose = {
  x: 0.55, y: 0.45, z: -1,
  scale: 0.45, stretchY: 1.5, noiseAmp: 0.05, twist: 0.8,
  shard: 0, ember: 0.2, facet: 0.85, rotSpeed: 0.06,
}

const videosPose = {
  x: -0.58, y: -0.1, z: -0.8,
  scale: 0.5, stretchY: 1.0, noiseAmp: 0.08, twist: 0.2,
  shard: 0, ember: 0.3, facet: 0.75, rotSpeed: 0.05,
}

const writingPose = {
  x: 0, y: -0.85, z: -1.2,
  scale: 0.42, stretchY: 2.6, noiseAmp: 0.03, twist: 0,
  shard: 0, ember: 0.15, facet: 0.9, rotSpeed: 0.03,
}

const honoursPose = {
  x: 0.6, y: 0, z: -1,
  scale: 0.45, stretchY: 1.9, noiseAmp: 0.04, twist: 0.1,
  shard: 0, ember: 0.25, facet: 0.9, rotSpeed: 0.04,
}

const contactPose = {
  x: 0, y: 0, z: 0.4,
  scale: 0.68, stretchY: 1.7, noiseAmp: 0.09, twist: 0.3,
  shard: 0, ember: 0.8, facet: 0.65, rotSpeed: 0.10,
}

// Ordered stops; double entries hold a pose steady across a long section.
export const STOPS = [
  { id: 'top', t: 0.0, pose: heroPose },
  { id: 'top', t: 0.45, pose: heroPose },
  { id: 'top', t: 0.95, pose: manifestoPose },
  { id: 'career', t: 0.08, pose: careerPose },
  { id: 'career', t: 0.92, pose: careerPose },
  { id: 'skills', t: 0.45, pose: skillsPose },
  { id: 'projects', t: 0.35, pose: projectsPose },
  { id: 'videos', t: 0.4, pose: videosPose },
  { id: 'writing', t: 0.45, pose: writingPose },
  { id: 'honours', t: 0.45, pose: honoursPose },
  { id: 'contact', t: 0.6, pose: contactPose },
]

export const POSE_KEYS = Object.keys(heroPose)

const smooth = t => t * t * (3 - 2 * t)

/**
 * Interpolate the pose for a global scroll progress.
 * @param stops  STOPS with a precomputed `p` (global 0..1) per stop, sorted
 * @param p      current scroll progress 0..1
 * @param out    object to write the interpolated pose into
 */
export function poseAt(stops, p, out) {
  if (!stops.length) return out
  let a = stops[0], b = stops[0]
  for (let i = 0; i < stops.length; i++) {
    if (stops[i].p <= p) { a = stops[i]; b = stops[Math.min(i + 1, stops.length - 1)] }
    else break
  }
  const span = b.p - a.p
  const t = span > 0 ? smooth(Math.min(1, Math.max(0, (p - a.p) / span))) : 0
  for (const k of POSE_KEYS) {
    out[k] = a.pose[k] + (b.pose[k] - a.pose[k]) * t
  }
  return out
}

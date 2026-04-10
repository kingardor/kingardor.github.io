/* eslint-disable react/no-unknown-property */
import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

/* ─── 2-D gradient noise + FBM ───────────────────────────────────────────── */
const NOISE_GLSL = /* glsl */`
vec2 hash2(vec2 p){
  p = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float gnoise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(
    mix(dot(hash2(i+vec2(0.,0.)), f-vec2(0.,0.)),
        dot(hash2(i+vec2(1.,0.)), f-vec2(1.,0.)), u.x),
    mix(dot(hash2(i+vec2(0.,1.)), f-vec2(0.,1.)),
        dot(hash2(i+vec2(1.,1.)), f-vec2(1.,1.)), u.x),
  u.y);
}

float fbm(vec2 p){
  float v = 0.0, amp = 0.5, freq = 1.0;
  for(int i = 0; i < 6; i++){
    v   += amp * gnoise(p * freq);
    amp  *= 0.5;
    freq *= 2.07;
    // slight rotation each octave to break grid artifacts
    p = mat2(0.8,-0.6, 0.6,0.8) * p;
  }
  return v;
}
`

/* ─── Vertex — trivial pass-through ──────────────────────────────────────── */
const VERT = /* glsl */`
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

/* ─── Fragment — Iq domain-warp aurora ───────────────────────────────────── */
const FRAG = /* glsl */`
${NOISE_GLSL}
varying vec2 vUv;
uniform float uTime;
uniform float uChaos;
uniform float uAspect;

void main(){
  /* ── Coordinate space: aspect-corrected, centred ── */
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);

  /* ── Squeeze vertically to get tall "curtain" silhouettes ── */
  p *= vec2(0.65, 1.35);

  /* ── Shift aurora mass toward lower half of screen ── */
  p.y += 0.15;

  float spd = mix(0.055, 0.38, uChaos);
  float t   = uTime * spd;

  /* ── 3-layer Iq domain warping ── */
  vec2 q = vec2(fbm(p                         + t * 0.5),
                fbm(p + vec2(3.7, 8.2)        + t * 0.4));

  float warp = mix(0.75, 2.6, uChaos);
  vec2 r = vec2(fbm(p + warp * q + vec2(1.7, 9.2) + t * 0.28),
                fbm(p + warp * q + vec2(8.3, 2.8) + t * 0.22));

  float f = fbm(p + warp * 1.3 * r + t * 0.12);

  /* ── Remap f to [0, 1] ── */
  f = 0.5 + 0.5 * f;

  /* ── Colour palette (4 stops, calm → chaos) ── */
  // Calm: near-black ember tones
  vec3 stopA_c = vec3(0.04, 0.00, 0.01);
  vec3 stopB_c = vec3(0.18, 0.03, 0.05);
  vec3 stopC_c = vec3(0.26, 0.04, 0.10);
  vec3 stopD_c = vec3(0.12, 0.01, 0.08);

  // Chaos: vivid red → pink → deep violet
  vec3 stopA_h = vec3(0.04, 0.00, 0.03);
  vec3 stopB_h = vec3(0.86, 0.14, 0.14);   // #dc2626
  vec3 stopC_h = vec3(0.86, 0.15, 0.47);   // #db2777
  vec3 stopD_h = vec3(0.42, 0.04, 0.55);   // deep violet highlight

  vec3 A = mix(stopA_c, stopA_h, uChaos);
  vec3 B = mix(stopB_c, stopB_h, uChaos);
  vec3 C = mix(stopC_c, stopC_h, uChaos);
  vec3 D = mix(stopD_c, stopD_h, uChaos);

  // Blend across 4 stops using f
  float t3 = f * 3.0;
  vec3 col;
  if(t3 < 1.0)      col = mix(A, B, t3);
  else if(t3 < 2.0) col = mix(B, C, t3 - 1.0);
  else               col = mix(C, D, t3 - 2.0);

  /* ── Vertical soft mask — aurora fades at very top & bottom ── */
  float vy   = vUv.y;
  float vmask = smoothstep(0.0, 0.25, vy) * smoothstep(1.0, 0.55, vy);

  /* ── Radial vignette — darker at corners ── */
  vec2 uv2  = vUv - 0.5;
  float vig = 1.0 - dot(uv2, uv2) * 2.2;
  vig = clamp(vig, 0.0, 1.0);

  /* ── Brightness: dim in calm, full in chaos ── */
  float bright = mix(0.45, 1.0, uChaos);
  col *= bright * vig;

  /* ── Alpha: barely there in calm, vivid in chaos ── */
  float alpha = mix(0.18, 0.78, uChaos) * (0.25 + 0.75 * f) * vmask * vig;
  alpha = clamp(alpha, 0.0, 1.0);

  gl_FragColor = vec4(col, alpha);
}
`

/* ─── Aurora mesh (full-screen plane) ────────────────────────────────────── */
function Aurora({ chaos }) {
  const meshRef = useRef()
  const { viewport } = useThree()

  const uniforms = useMemo(() => ({
    uTime:   { value: 0 },
    uChaos:  { value: 0 },
    uAspect: { value: 1 },
  }), [])

  useFrame(({ clock, size }) => {
    const mat = meshRef.current?.material
    if (!mat) return
    mat.uniforms.uChaos.value  = THREE.MathUtils.lerp(mat.uniforms.uChaos.value, chaos ? 1 : 0, 0.028)
    mat.uniforms.uTime.value   = clock.elapsedTime
    mat.uniforms.uAspect.value = size.width / size.height
  })

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

/* ─── Export ──────────────────────────────────────────────────────────────── */
export default function ChatBackground({ chaos = false }) {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}
    >
      <Canvas
        camera={{ position: [0, 0, 1], fov: 90 }}
        gl={{ alpha: true, antialias: false }}
      >
        <Aurora chaos={chaos} />
      </Canvas>
    </div>
  )
}

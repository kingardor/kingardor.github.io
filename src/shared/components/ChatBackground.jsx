/* eslint-disable react/no-unknown-property */
import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

/* ─── Noise helpers ───────────────────────────────────────────────────────── */
const NOISE_GLSL = /* glsl */`
vec2 hash2(vec2 p){
  p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
  return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}
float gnoise(vec2 p){
  vec2 i=floor(p), f=fract(p), u=f*f*(3.0-2.0*f);
  return mix(
    mix(dot(hash2(i+vec2(0,0)),f-vec2(0,0)), dot(hash2(i+vec2(1,0)),f-vec2(1,0)),u.x),
    mix(dot(hash2(i+vec2(0,1)),f-vec2(0,1)), dot(hash2(i+vec2(1,1)),f-vec2(1,1)),u.x),
  u.y);
}
float fbm2(vec2 p){
  float v=0.,a=0.5;
  for(int i=0;i<4;i++){ v+=a*gnoise(p); p=mat2(.8,-.6,.6,.8)*p*2.1; a*=.5; }
  return v;
}
`

/* ─── Vertex ──────────────────────────────────────────────────────────────── */
const VERT = /* glsl */`
varying vec2 vUv;
void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }
`

/* ─── Fragment — vertical aurora curtains ────────────────────────────────── */
const FRAG = /* glsl */`
${NOISE_GLSL}
varying vec2 vUv;
uniform float uTime;
uniform float uChaos;
uniform float uAspect;

// Sinusoidal curtain ray: a vertical stripe that wavers horizontally
float curtainRay(vec2 uv, float xFreq, float tOffset, float wobble, float sharp){
  float t = uTime * mix(0.04, 0.28, uChaos) + tOffset;
  // Horizontal displacement driven by slow noise
  float xDisp = wobble * gnoise(vec2(uv.y * 1.2, t * 0.5));
  float xDisp2 = wobble * 0.4 * gnoise(vec2(uv.y * 2.8, t * 0.7 + 5.3));
  float ray = sin((uv.x + xDisp + xDisp2) * xFreq + t);
  // Soft rectify: keep only bright half
  ray = clamp(ray, 0.0, 1.0);
  return pow(ray, sharp);
}

void main(){
  vec2 uv = vUv;
  // Centre and correct aspect
  vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);

  float chaos = uChaos;

  // ── Curtain sharpness: tight/dim in calm, wide/soft in chaos ──
  float sharp = mix(5.0, 1.4, chaos);

  // ── 4 overlapping curtain rays at different spatial frequencies ──
  float r0 = curtainRay(p, 2.8,  0.0,  mix(0.04,0.25,chaos), sharp);
  float r1 = curtainRay(p, 4.1,  1.7,  mix(0.06,0.30,chaos), sharp) * 0.7;
  float r2 = curtainRay(p, 1.9,  3.3,  mix(0.05,0.22,chaos), sharp) * 0.85;
  float r3 = curtainRay(p, 6.2,  5.1,  mix(0.03,0.18,chaos), sharp) * 0.5;

  float curtain = r0 + r1 + r2 + r3;
  curtain = clamp(curtain * mix(0.28, 0.95, chaos), 0.0, 1.0);

  // ── Fine filaments: high-freq noise detail ──
  float detail = fbm2(vec2(p.x * 4.5, p.y * 3.0 + uTime * mix(0.02,0.12,chaos)));
  detail = 0.5 + 0.5 * detail;
  curtain = mix(curtain, curtain * detail, 0.35);

  // ── Vertical mask: aurora band sits in middle third ──
  float yBand  = 0.38 + 0.08 * gnoise(vec2(uTime * 0.05, 0.5));
  float yRange = mix(0.18, 0.42, chaos);
  float yMask  = exp(-pow((uv.y - yBand) / yRange, 2.0));

  // ── Bottom ground glow ──
  float glow = exp(-uv.y * 6.0) * mix(0.08, 0.35, chaos);

  // ── Height-based colour within each curtain ──
  // 0 = bottom (darker red / ember), 1 = top edge (pink / violet)
  float colorT = clamp((uv.y - (yBand - yRange)) / (yRange * 2.0), 0.0, 1.0);

  // Calm palette (near-black ember)
  vec3 botCalm = vec3(0.10, 0.01, 0.02);
  vec3 topCalm = vec3(0.20, 0.03, 0.10);

  // Chaos palette (red → pink → violet tips)
  vec3 botChaos = vec3(0.86, 0.14, 0.14);   // #dc2626
  vec3 midChaos = vec3(0.86, 0.15, 0.47);   // #db2777
  vec3 topChaos = vec3(0.44, 0.04, 0.58);   // deep violet

  vec3 colCalm  = mix(botCalm, topCalm, colorT);
  vec3 colChaos = colorT < 0.5
    ? mix(botChaos, midChaos, colorT * 2.0)
    : mix(midChaos, topChaos, (colorT - 0.5) * 2.0);

  vec3 col = mix(colCalm, colChaos, chaos);

  // Ground glow tint
  col += mix(vec3(0.10,0.01,0.01), vec3(0.70,0.08,0.08), chaos) * glow;

  // ── Alpha ──
  float baseAlpha = mix(0.12, 0.82, chaos);
  float alpha = baseAlpha * (curtain * yMask + glow);
  alpha = clamp(alpha, 0.0, 1.0);

  gl_FragColor = vec4(col, alpha);
}
`

/* ─── R3F component ───────────────────────────────────────────────────────── */
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

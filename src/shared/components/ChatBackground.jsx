/* eslint-disable react/no-unknown-property */
import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

/* ─── Simplex noise (3D) ─────────────────────────────────────────────────── */
const NOISE_GLSL = /* glsl */`
vec3 mod289v3(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289v4(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289v4(((x*34.)+10.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}

float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289v3(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.,i1.z,i2.z,1.))+
    i.y+vec4(0.,i1.y,i2.y,1.))+
    i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 105.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`

/* ─── Particle shaders ───────────────────────────────────────────────────── */
const PARTICLE_VERT = /* glsl */`
${NOISE_GLSL}

uniform float uTime;
uniform float uChaos;
attribute float aRandom;
varying float vRandom;
varying float vDist;
varying float vChaos;

void main(){
  vRandom = aRandom;
  vChaos  = uChaos;

  vec3 pos = position;
  float r = length(pos.xz);       // radial in galaxy plane

  // ── Calm: slow noise drift + galaxy rotation ─────────────────────────
  float t      = uTime * 0.18;
  float rotSpd = mix(0.08, 0.55, uChaos);
  float angle  = atan(pos.z, pos.x) + uTime * rotSpd * (1. - r * 0.12);
  float newR   = r;
  pos.x = cos(angle) * newR;
  pos.z = sin(angle) * newR;

  float noiseAmt = mix(0.06, 1.8, uChaos);
  float spd      = mix(0.10, 2.0, uChaos);
  float nx = snoise(vec3(pos.x * .45, pos.y * .45, t * spd));
  float ny = snoise(vec3(pos.y * .45, pos.z * .45, t * spd + 33.));
  float nz = snoise(vec3(pos.z * .45, pos.x * .45, t * spd + 66.));
  pos += vec3(nx, ny, nz) * noiseAmt;

  // ── Chaos: radial burst pulse ─────────────────────────────────────────
  if(uChaos > 0.01){
    float pulse  = sin(uTime * 5.5 + aRandom * 6.28) * .5 + .5;
    float radial = uChaos * 1.8 * pulse;
    pos += normalize(position + .001) * radial;
  }

  vDist = length(pos);

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.);
  // point size: small calm, larger chaos; nearer = bigger
  float sz = mix(1.2, 4.2, uChaos) * (1. + aRandom * 0.9);
  gl_PointSize = sz * (280. / -mvPos.z);
  gl_Position  = projectionMatrix * mvPos;
}
`

const PARTICLE_FRAG = /* glsl */`
uniform float uChaos;
varying float vRandom;
varying float vDist;
varying float vChaos;

void main(){
  // soft circle
  vec2  uv = gl_PointCoord - .5;
  float r  = length(uv);
  if(r > .5) discard;
  float alpha = smoothstep(.5, .0, r);

  // red core → pink outer  based on galaxy radius
  float t     = clamp(vDist / 3.5, 0., 1.);
  vec3 cAlpha = mix(vec3(1., .12, .12), vec3(.92, .18, .58), t);   // calm palette
  vec3 cChaos = mix(vec3(1., .25, .1),  vec3(1.,  .1,  .85), t);   // chaos palette
  vec3 col    = mix(cAlpha, cChaos, vChaos);

  // individual particle flicker in chaos
  float flicker = mix(1., .55 + .45 * sin(vRandom * 432. + vChaos * 12.), vChaos);
  float bright  = mix(.55, 1.1, vChaos) * flicker;

  gl_FragColor = vec4(col * bright, alpha * mix(.09, .55, vChaos));
}
`

/* ─── Central core shaders ───────────────────────────────────────────────── */
const CORE_VERT = /* glsl */`
void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
`
const CORE_FRAG = /* glsl */`
uniform float uTime;
uniform float uChaos;
void main(){
  float pulse  = sin(uTime * mix(1.4, 8., uChaos)) * .5 + .5;
  float size   = mix(.28, .95, uChaos * pulse);
  vec3  col    = mix(vec3(1.,.08,.08), vec3(1.,.25,.85), uChaos);
  float glow   = mix(.55, 1.0, uChaos);
  gl_FragColor = vec4(col * glow, mix(.6, .92, uChaos * pulse));
}
`

/* ─── Components ─────────────────────────────────────────────────────────── */
function ParticleField({ chaos }) {
  const ref = useRef()
  const COUNT = 1100

  const { positions, randoms } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const randoms   = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      // 3-arm galaxy distribution — flatter, wider, sparser
      const arm    = Math.floor(Math.random() * 3)
      const theta  = (arm / 3) * Math.PI * 2 + (Math.random() ** 0.65) * 3.2
      const radius = Math.random() ** 0.62 * 5.0 + 0.6   // min 0.6, max ~5.6
      const scatter = Math.max(0.15, 0.7 - radius * 0.08)
      positions[i * 3]     = Math.cos(theta) * radius + (Math.random() - 0.5) * scatter * 2.2
      positions[i * 3 + 1] = (Math.random() - 0.5) * scatter * 0.7   // thin disk
      positions[i * 3 + 2] = Math.sin(theta) * radius + (Math.random() - 0.5) * scatter * 2.2
      randoms[i] = Math.random()
    }
    return { positions, randoms }
  }, [])

  const uniforms = useMemo(() => ({
    uTime:  { value: 0 },
    uChaos: { value: 0 },
  }), [])

  useFrame(({ clock }) => {
    uniforms.uTime.value  = clock.elapsedTime
    uniforms.uChaos.value = THREE.MathUtils.lerp(uniforms.uChaos.value, chaos ? 1 : 0, 0.028)
    ref.current.material.uniforms.uTime.value  = uniforms.uTime.value
    ref.current.material.uniforms.uChaos.value = uniforms.uChaos.value
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom"   count={COUNT} array={randoms}    itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={PARTICLE_VERT}
        fragmentShader={PARTICLE_FRAG}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
      />
    </points>
  )
}

function Core({ chaos }) {
  const ref = useRef()
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uChaos: { value: 0 } }), [])

  useFrame(({ clock }) => {
    const c = THREE.MathUtils.lerp(uniforms.uChaos.value, chaos ? 1 : 0, 0.028)
    uniforms.uTime.value  = clock.elapsedTime
    uniforms.uChaos.value = c
    ref.current.material.uniforms.uTime.value  = uniforms.uTime.value
    ref.current.material.uniforms.uChaos.value = c
    // core is tiny in calm, pulses up in chaos
    const s = 0.04 + c * 0.18 * (Math.sin(clock.elapsedTime * 7) * 0.5 + 0.5)
    ref.current.scale.setScalar(s)
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 16, 16]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={CORE_VERT}
        fragmentShader={CORE_FRAG}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

function Scene({ chaos }) {
  return (
    <>
      <ParticleField chaos={chaos} />
      <Core chaos={chaos} />
      <EffectComposer>
        <Bloom
          intensity={chaos ? 1.6 : 0.28}
          luminanceThreshold={0.32}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}

export default function ChatBackground({ chaos = false }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 4.5, 9], fov: 55 }}
        gl={{ alpha: true, antialias: false }}
      >
        <Scene chaos={chaos} />
      </Canvas>
    </div>
  )
}

// Vertex shader: all shape change is uniform-driven (no morph targets) so any
// two section poses interpolate continuously — slab, stele, sphere, shards.
export default /* glsl */ `
uniform float uTime;
uniform float uNoiseAmp;     // simplex displacement amplitude
uniform float uStretchY;     // monolith slab elongation
uniform float uTwist;        // radians of twist over the height
uniform float uDissolve;     // 0 = solid, 1 = fully scattered (materialize fx)
uniform float uShard;        // 0 = whole, 1 = four clusters separated radially

varying vec3 vPos;           // displaced local-space position (facet normals)
varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vDispN;        // normalized |displacement| — ember crevice mask
varying float vHash;         // per-vertex random — dissolve threshold

// ── Ashima simplex 3D ──────────────────────────────────────────────────────
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float hash13(vec3 p){
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void main() {
  vec3 pos = position;
  vec3 nrm = normal;

  // Slab elongation
  pos.y *= uStretchY;

  // Twist around Y, proportional to height
  float ang = uTwist * pos.y;
  float c = cos(ang), s = sin(ang);
  pos.xz = mat2(c, -s, s, c) * pos.xz;
  nrm.xz = mat2(c, -s, s, c) * nrm.xz;

  // Shard separation: four clusters by XZ octant, pushed radially apart
  if (uShard > 0.001) {
    vec2 q = sign(position.xz + vec2(0.0001));
    vec3 dir = normalize(vec3(q.x, 0.35 * q.x * q.y, q.y));
    pos += dir * uShard * 0.9;
  }

  // Organic displacement: two octaves of drifting simplex
  float n = snoise(position * 1.6 + vec3(0.0, uTime * 0.08, 0.0))
          + 0.45 * snoise(position * 4.2 - vec3(uTime * 0.05, 0.0, 0.0));
  float disp = n * uNoiseAmp;
  pos += normal * disp;
  vDispN = clamp(abs(n), 0.0, 1.0);

  // Dissolve scatter: vertices fly outward as their hash crosses the threshold
  float h = hash13(position);
  vHash = h;
  float scatter = uDissolve * smoothstep(uDissolve - 0.25, uDissolve + 0.05, h);
  pos += normal * scatter * 1.6 * (0.4 + h);

  vPos = pos;
  // World-space normal (model has uniform scale only)
  vNormal = normalize(mat3(modelMatrix) * nrm);
  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

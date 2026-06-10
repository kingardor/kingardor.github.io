// Fragment shader: fully procedural obsidian — no lights, no env maps.
// Fresnel rim + two fake speculars + ember emissive in displacement crevices.
// Ember output intentionally exceeds the bloom luminance threshold (0.6) so
// only the veins glow; bone rim stays below it.
export default /* glsl */ `
uniform float uTime;
uniform float uEmber;        // 0..1 — how lit the ember veins are
uniform float uDissolve;     // shared with vertex stage for edge glow
uniform float uFacet;        // 0 = smooth normals, 1 = flat-faceted
uniform float uNoiseAmp;     // gates vein visibility to agitated surfaces

varying vec3 vPos;
varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vDispN;
varying float vHash;

const vec3 BONE  = vec3(0.925, 0.913, 0.886);  // #ece9e2
const vec3 EMBER = vec3(1.0, 0.24, 0.0);       // #ff3d00
const vec3 BASE  = vec3(0.022, 0.021, 0.020);  // near-black obsidian

void main() {
  // Dissolve clip with ember edge: fragments just above the threshold ignite
  if (vHash < uDissolve) discard;
  float edge = 1.0 - smoothstep(0.0, 0.06, vHash - uDissolve);

  // Faceted normals from screen-space derivatives of the world position —
  // both candidate normals are world-space, as is all lighting below
  vec3 flatN = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
  vec3 n = normalize(mix(normalize(vNormal), flatN, clamp(uFacet, 0.0, 1.0)));

  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float ndv = max(dot(n, viewDir), 0.0);

  // Rim — restrained: the form should read as a black silhouette with a
  // bone edge, not a plastic-wrapped glow
  float fresnel = pow(1.0 - ndv, 4.0);

  // Two fake key lights (glossy obsidian speculars, tight)
  vec3 l1 = normalize(vec3(0.6, 0.8, 0.45));
  vec3 l2 = normalize(vec3(-0.7, -0.2, 0.6));
  float spec1 = pow(max(dot(reflect(-l1, n), viewDir), 0.0), 90.0);
  float spec2 = pow(max(dot(reflect(-l2, n), viewDir), 0.0), 32.0);

  // Ember veins: thin cracks in the deepest noise crevices only, and only
  // when the surface is actually agitated (scales with uNoiseAmp)
  float pulse = 0.85 + 0.15 * sin(uTime * 0.9 + vWorldPos.y * 2.0);
  float vein = smoothstep(0.78, 0.99, vDispN) * smoothstep(0.02, 0.12, abs(uNoiseAmp));
  vec3 ember = EMBER * uEmber * pulse * (vein * 1.6 + 0.02);

  vec3 color = BASE
    + BONE * fresnel * 0.22
    + BONE * spec1 * 0.35
    + BONE * spec2 * 0.08
    + ember
    + EMBER * edge * (uDissolve > 0.001 ? 1.8 : 0.0);

  gl_FragColor = vec4(color, 1.0);
}
`

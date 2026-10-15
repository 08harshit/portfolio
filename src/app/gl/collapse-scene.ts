/**
 * Payload optimization scene: a large dim slab (1.4MB) collapses into a small
 * bright block (10KB) as uReveal advances, shedding fragment particles that
 * drift outward and fade - the 95% reduction is felt as a physical collapse,
 * not read off a percentage.
 */

const f = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n));

/** Deterministic per-shard hash, so shards scatter but reproduce identically every frame. */
function hashGlsl(): string {
  return `
float hash11(float n) { return fract(sin(n) * 43758.5453123); }
vec3 hash31(float n) {
  return fract(sin(vec3(n, n + 1.0, n + 2.0) * vec3(127.1, 311.7, 74.7)) * 43758.5453123);
}`;
}

export function collapseFrag(steps: number, shardCount: number): string {
  return `#version 300 es
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uReveal;    // 0 = offscreen, 1 = settled in view (drives entrance only)
uniform vec2  uMouse;

out vec4 fragColor;

const float FOCAL = 1.7;
const vec3  BEFORE_COLOR = vec3(0.973, 0.443, 0.443); // red-400
const vec3  AFTER_COLOR  = vec3(0.063, 0.725, 0.506);  // emerald-500
const int   SHARDS = ${shardCount};

${hashGlsl()}

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

vec2 minMat(vec2 a, vec2 b) { return a.x < b.x ? a : b; }

/**
 * Collapse progress: a slow looping 0->1->hold->reset so the scene keeps
 * demonstrating the transformation rather than freezing on the end state.
 */
float collapseK(float t) {
  float cycle = mod(t, 6.0) / 6.0;
  return smoothstep(0.08, 0.55, cycle) * (1.0 - smoothstep(0.9, 1.0, cycle) * 0.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;

  float angle = 0.35 + uMouse.x * 0.3;
  vec3  ro = vec3(sin(angle) * 5.2, 1.1 + uMouse.y * 0.5, cos(angle) * 5.2);
  vec3  fw = normalize(-ro);
  vec3  rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3  up = cross(rt, fw);
  vec3  rd = normalize(uv.x * rt + uv.y * up + FOCAL * fw);

  float k = collapseK(uTime);            // 0 = full 1.4MB slab, 1 = collapsed 10KB block
  float bigDim = mix(1.0, 0.16, k);
  vec3  bigHalf = vec3(1.15, 0.7, 0.85) * mix(1.0, 0.22, k);
  vec3  col = vec3(0.0);
  vec3  bodyColor = mix(BEFORE_COLOR, AFTER_COLOR, smoothstep(0.15, 0.75, k));

  float t = 0.0;
  float hitMat = 0.0;

  for (int i = 0; i < ${steps}; i++) {
    vec3 p = ro + rd * t;
    vec2 res = vec2(1e5, 0.0);

    // The collapsing core: shrinks from a wide dim slab to a small bright block.
    res = minMat(res, vec2(sdRoundBox(p, bigHalf, 0.05 + k * 0.05), 1.0));

    // Shed fragments: each shard flies outward along a fixed random direction,
    // scaled by k and fading as it goes - the "excess mass" breaking off.
    for (int s = 0; s < SHARDS; s++) {
      float n = float(s);
      vec3 dir = normalize(hash31(n) - 0.5);
      float delay = hash11(n * 3.1) * 0.35;
      float sk = clamp((k - delay) / (1.0 - delay), 0.0, 1.0);
      vec3 shardPos = dir * sk * 2.6 * (0.5 + hash11(n * 7.7) * 0.8);
      float shardSize = mix(0.05, 0.0, sk) * (0.5 + hash11(n * 1.7) * 0.5);
      if (shardSize > 0.0005) {
        res = minMat(res, vec2(length(p - shardPos) - shardSize, 2.0));
      }
    }

    col += (res.y > 1.5 ? BEFORE_COLOR : bodyColor) * exp(-res.x * 7.0) * 0.05;

    if (res.x < 0.0016) { hitMat = res.y; break; }
    t += res.x;
    if (t > 18.0) break;
  }

  if (hitMat > 0.5) {
    float core = hitMat > 1.5 ? 0.4 : (0.12 + k * 0.5);
    col += (hitMat > 1.5 ? BEFORE_COLOR : bodyColor) * core;
  }

  col = 1.0 - exp(-col * 1.5);
  col = pow(max(col, 0.0), vec3(0.4545));

  float alpha = clamp(max(col.r, max(col.g, col.b)) * 1.3, 0.0, 1.0) * uReveal;
  fragColor = vec4(col, alpha);
}`;
}

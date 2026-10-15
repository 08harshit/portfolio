/**
 * The BigQuery audit pipeline, described once and consumed twice: the GLSL scene
 * is generated from these same constants that the DOM label projection uses, so
 * the shader and the HTML captions can never drift out of alignment.
 */

export type Shape =
  | { kind: 'box'; dims: readonly [number, number, number]; round: number }
  | { kind: 'capsule'; half: number; radius: number };

export interface PipelineNode {
  id: string;
  label: string;
  detail: string;
  pos: readonly [number, number, number];
  shape: Shape;
  /** Material index -> colour in PALETTE. */
  mat: number;
  /** Progress window over which the node scales up from nothing. */
  reveal: readonly [number, number];
  /** Which side of the node the DOM caption sits on, and its clearance in px. */
  anchor: 'above' | 'below' | 'left' | 'right';
  offset: number;
  /** Tailwind text colour for the caption, kept in step with `mat`. */
  tone: string;
}

export interface PipelineSegment {
  from: string;
  to: string;
  mat: number;
  reveal: readonly [number, number];
  /** Packets per segment length; higher = denser traffic. */
  density: number;
  speed: number;
}

/** Matches the Tailwind tokens already used across the site. */
export const PALETTE: Record<number, readonly [number, number, number]> = {
  1: [0.063, 0.725, 0.506], // emerald-500  - source of truth / happy path
  2: [0.984, 0.573, 0.235], // orange-400   - Kafka
  3: [0.973, 0.443, 0.443], // red-400      - dead-letter queue
  4: [0.376, 0.647, 0.98], // blue-400     - BigQuery
  5: [0.85, 0.87, 0.9], // neutral      - processor
};

export const NODES: readonly PipelineNode[] = [
  {
    id: 'pg',
    label: 'PostgreSQL',
    detail: 'pg_notify triggers',
    pos: [0, 3.3, 0],
    shape: { kind: 'box', dims: [0.95, 0.3, 0.6], round: 0.08 },
    mat: 1,
    reveal: [0.0, 0.14],
    anchor: 'above',
    offset: 34,
    tone: 'text-emerald-400',
  },
  {
    id: 'kafka',
    label: 'Apache Kafka',
    detail: 'partitioned log',
    pos: [0, 0.9, 0],
    shape: { kind: 'capsule', half: 0.8, radius: 0.33 },
    mat: 2,
    reveal: [0.22, 0.36],
    anchor: 'above',
    offset: 40,
    tone: 'text-orange-400',
  },
  {
    id: 'proc',
    label: 'Processor',
    detail: 'batch + transform',
    pos: [-1.85, -1.3, 0],
    shape: { kind: 'box', dims: [0.58, 0.3, 0.42], round: 0.07 },
    mat: 5,
    reveal: [0.45, 0.57],
    anchor: 'left',
    offset: 42,
    tone: 'text-foreground/80',
  },
  {
    id: 'dlq',
    label: 'Dead-letter queue',
    detail: 'replayable failures',
    pos: [1.85, -1.3, 0],
    shape: { kind: 'box', dims: [0.5, 0.27, 0.38], round: 0.06 },
    mat: 3,
    reveal: [0.7, 0.81],
    anchor: 'right',
    offset: 42,
    tone: 'text-red-400',
  },
  {
    id: 'bq',
    label: 'Google BigQuery',
    detail: 'queryable audit trail',
    pos: [0, -3.5, 0],
    shape: { kind: 'box', dims: [1.2, 0.34, 0.62], round: 0.09 },
    mat: 4,
    reveal: [0.86, 0.99],
    anchor: 'below',
    offset: 38,
    tone: 'text-blue-400',
  },
];

export const SEGMENTS: readonly PipelineSegment[] = [
  { from: 'pg', to: 'kafka', mat: 1, reveal: [0.12, 0.3], density: 4, speed: 0.55 },
  { from: 'kafka', to: 'proc', mat: 2, reveal: [0.36, 0.52], density: 3, speed: 0.6 },
  { from: 'kafka', to: 'dlq', mat: 3, reveal: [0.62, 0.76], density: 2, speed: 0.35 },
  { from: 'proc', to: 'bq', mat: 5, reveal: [0.8, 0.94], density: 3, speed: 0.5 },
];

// --- camera -----------------------------------------------------------------
// Shared by the shader (interpolated below) and by projectNode() for DOM labels.

const FOCAL = 1.75;

export interface Camera {
  origin: [number, number, number];
  right: [number, number, number];
  up: [number, number, number];
  forward: [number, number, number];
}

export function camera(progress: number, mouseX: number, mouseY: number): Camera {
  // The camera tracks the revealed extent: it starts close on PostgreSQL and
  // pulls back as nodes appear, so the growing pipeline stays framed instead of
  // outgrowing the viewport.
  const angle = -0.4 + progress * 0.52 + mouseX * 0.22;
  const radius = 7.6 + progress * 4.4;
  const height = 0.35 + mouseY * 0.5;
  const target: [number, number, number] = [0, 2.7 - progress * 2.8, 0];

  const origin: [number, number, number] = [
    target[0] + Math.sin(angle) * radius,
    target[1] + height,
    target[2] + Math.cos(angle) * radius,
  ];

  const forward = normalize(sub(target, origin));
  const right = normalize(cross(forward, [0, 1, 0]));
  const up = cross(right, forward);
  return { origin, right, up, forward };
}

/**
 * Projects a world point to CSS pixels within the canvas, mirroring exactly what
 * the fragment shader does when it builds its ray direction.
 * Returns null when the point is behind the camera.
 */
export function projectNode(
  world: readonly [number, number, number],
  cam: Camera,
  cssWidth: number,
  cssHeight: number
): { x: number; y: number; depth: number } | null {
  const rel = sub(world, cam.origin);
  const z = dot(rel, cam.forward);
  if (z <= 0.05) return null;

  const uvx = (FOCAL * dot(rel, cam.right)) / z;
  const uvy = (FOCAL * dot(rel, cam.up)) / z;

  // Inverse of uv = (fragCoord * 2 - res) / res.y, then flipped to DOM coordinates.
  const px = (uvx * cssHeight + cssWidth) / 2;
  const py = (uvy * cssHeight + cssHeight) / 2;
  return { x: px, y: cssHeight - py, depth: z };
}

const sub = (a: readonly number[], b: readonly number[]): [number, number, number] => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];
const dot = (a: readonly number[], b: readonly number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: readonly number[], b: readonly number[]): [number, number, number] => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
function normalize(v: readonly number[]): [number, number, number] {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

// --- shader generation ------------------------------------------------------

/** GLSL needs unambiguous float literals. */
const f = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n));
const v3 = (v: readonly number[]) => `vec3(${f(v[0])}, ${f(v[1])}, ${f(v[2])})`;

const nodeById = (id: string) => {
  const node = NODES.find((n) => n.id === id);
  if (!node) throw new Error(`unknown pipeline node: ${id}`);
  return node;
};

function nodeGlsl(node: PipelineNode): string {
  const rv = `rv_${node.id}`;
  const q = `p - ${v3(node.pos)}`;
  const shape =
    node.shape.kind === 'box'
      ? `sdRoundBox(q, ${v3(node.shape.dims)} * ${rv}, ${f(node.shape.round)} * ${rv})`
      : `sdCapsule(q, vec3(-${f(node.shape.half)} * ${rv}, 0.0, 0.0), vec3(${f(
          node.shape.half
        )} * ${rv}, 0.0, 0.0), ${f(node.shape.radius)} * ${rv})`;

  return `
  {
    float ${rv} = smoothstep(${f(node.reveal[0])}, ${f(node.reveal[1])}, uProgress);
    if (${rv} > 0.002) {
      vec3 q = ${q};
      res = minMat(res, vec2(${shape}, ${f(node.mat)}));
    }
  }`;
}

function segmentGlsl(seg: PipelineSegment): string {
  const a = nodeById(seg.from);
  const b = nodeById(seg.to);
  return `
  {
    float rv = smoothstep(${f(seg.reveal[0])}, ${f(seg.reveal[1])}, uProgress);
    if (rv > 0.002) {
      vec3 a = ${v3(a.pos)};
      vec3 b = ${v3(b.pos)};
      res = minMat(res, vec2(conduit(p, a, b, rv), ${f(seg.mat)}));
      res = minMat(res, vec2(
        packets(p, a, b, uTime * ${f(seg.speed)}, ${f(seg.density)}, 0.062, rv),
        ${f(seg.mat)}));
    }
  }`;
}

function paletteGlsl(): string {
  const cases = Object.entries(PALETTE)
    .map(([mat, rgb]) => `  if (m < ${f(Number(mat) + 0.5)}) return ${v3(rgb)};`)
    .join('\n');
  return `vec3 matColor(float m) {\n${cases}\n  return vec3(1.0);\n}`;
}

/**
 * @param steps march iterations - the single biggest cost knob (56 desktop, 32 mobile).
 */
export function pipelineFrag(steps: number): string {
  return `#version 300 es
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uProgress;
uniform vec2  uMouse;

out vec4 fragColor;

const float FOCAL = ${f(FOCAL)};

${paletteGlsl()}

vec2 minMat(vec2 a, vec2 b) { return a.x < b.x ? a : b; }

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

/** The thin line joining two nodes, growing from 'a' toward 'b' as it reveals. */
float conduit(vec3 p, vec3 a, vec3 b, float reveal) {
  return sdCapsule(p, a, mix(a, b, reveal), 0.012);
}

/**
 * Distance to an infinite train of packets travelling a->b, evaluated in O(1):
 * project onto the axis, then snap to the nearest packet slot on that axis
 * instead of looping over individual spheres.
 */
float packets(vec3 p, vec3 a, vec3 b, float phase, float count, float radius, float reveal) {
  vec3 ba = b - a;
  float len = length(ba);
  vec3 dir = ba / len;
  vec3 pa = p - a;
  float h = dot(pa, dir);
  float radial = length(pa - dir * h);

  float spacing = len / count;
  float travelled = fract(phase) * spacing;
  float slot = floor((h - travelled) / spacing + 0.5) * spacing + travelled;
  slot = clamp(slot, 0.0, len * reveal);

  return length(vec2(radial, h - slot)) - radius;
}

vec2 map(vec3 p) {
  vec2 res = vec2(1e5, 0.0);
${NODES.map(nodeGlsl).join('\n')}
${SEGMENTS.map(segmentGlsl).join('\n')}
  return res;
}

vec3 normalAt(vec3 p) {
  // Tetrahedral 4-tap gradient. Only hit pixels pay for this.
  const vec2 k = vec2(1.0, -1.0);
  const float h = 0.0015;
  return normalize(
    k.xyy * map(p + k.xyy * h).x +
    k.yyx * map(p + k.yyx * h).x +
    k.yxy * map(p + k.yxy * h).x +
    k.xxx * map(p + k.xxx * h).x
  );
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;

  float angle  = -0.4 + uProgress * 0.52 + uMouse.x * 0.22;
  float radius = 7.6 + uProgress * 4.4;
  vec3  target = vec3(0.0, 2.7 - uProgress * 2.8, 0.0);
  vec3  ro = target + vec3(sin(angle) * radius, 0.35 + uMouse.y * 0.5, cos(angle) * radius);

  vec3 fw = normalize(target - ro);
  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, fw);
  vec3 rd = normalize(uv.x * rt + uv.y * up + FOCAL * fw);

  vec3  col = vec3(0.0);
  float t = 0.0;
  float hitMat = 0.0;
  vec3  hitPos = vec3(0.0);

  for (int i = 0; i < ${steps}; i++) {
    vec3 p = ro + rd * t;
    vec2 res = map(p);

    // Volumetric glow accumulated inside the march: bloom without a post-pass,
    // extra render targets, or a second geometry pass. The falloff is tight so
    // the glow hugs the geometry instead of washing it out.
    col += matColor(res.y) * exp(-res.x * 9.0) * 0.05;

    if (res.x < 0.0018) { hitMat = res.y; hitPos = p; break; }
    t += res.x;
    if (t > 26.0) break;
  }

  if (hitMat > 0.5) {
    vec3 base = matColor(hitMat);
    vec3 n = normalAt(hitPos);
    // Dim core, bright edge: reads as a lit volume rather than a flat slab.
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 1.7);
    col += base * (0.07 + rim * 2.1);
  }

  col = 1.0 - exp(-col * 1.45);          // filmic rolloff keeps the cores from clipping
  col = pow(max(col, 0.0), vec3(0.4545)); // linear -> sRGB

  float alpha = clamp(max(col.r, max(col.g, col.b)) * 1.25, 0.0, 1.0);
  fragColor = vec4(col, alpha);
}`;
}

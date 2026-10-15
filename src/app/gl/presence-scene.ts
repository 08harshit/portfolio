/**
 * WebSocket collaboration scene: a Socket.IO gateway hub with orbiting client
 * nodes. Idle-time driven (not scroll-scrubbed) - it's a loop that demonstrates
 * "one client acts, everyone sees it instantly," which is a statement about
 * behaviour over time, not a sequence to scrub through.
 */

export interface ClientNode {
  id: number;
  /** Orbit radius and phase offset - irregular so the ring doesn't look mechanical. */
  radius: number;
  phase: number;
  speed: number;
  tone: string;
}

export const CLIENTS: readonly ClientNode[] = [
  { id: 0, radius: 2.5, phase: 0.0, speed: 0.09, tone: 'text-emerald-400' },
  { id: 1, radius: 2.9, phase: 1.4, speed: -0.07, tone: 'text-emerald-400' },
  { id: 2, radius: 2.3, phase: 2.9, speed: 0.11, tone: 'text-emerald-400' },
  { id: 3, radius: 3.1, phase: 4.3, speed: -0.08, tone: 'text-emerald-400' },
  { id: 4, radius: 2.7, phase: 5.5, speed: 0.06, tone: 'text-emerald-400' },
];

/** Seconds per full broadcast cycle: one client fires, hub relays to the rest. */
export const CYCLE = 3.2;

const f = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n));

function clientsArrayGlsl(): string {
  const radius = CLIENTS.map((c) => f(c.radius)).join(', ');
  const phase = CLIENTS.map((c) => f(c.phase)).join(', ');
  const speed = CLIENTS.map((c) => f(c.speed)).join(', ');
  return `
const int   CLIENT_COUNT = ${CLIENTS.length};
const float CLIENT_RADIUS[${CLIENTS.length}] = float[](${radius});
const float CLIENT_PHASE[${CLIENTS.length}]  = float[](${phase});
const float CLIENT_SPEED[${CLIENTS.length}]  = float[](${speed});`;
}

/**
 * World-space position of client `i` at time `t`. Exported so the component can
 * project the same orbit for DOM labels without duplicating the formula.
 */
export function clientPosition(i: number, t: number): [number, number, number] {
  const c = CLIENTS[i];
  const angle = c.phase + t * c.speed * Math.PI * 2;
  return [Math.cos(angle) * c.radius, Math.sin(angle * 0.6) * 0.4, Math.sin(angle) * c.radius];
}

/** Which client is actively "firing" this cycle, and how far into the broadcast we are (0-1). */
export function broadcastPhase(t: number): { firing: number; k: number } {
  const cycle = t / CYCLE;
  const firing = Math.floor(cycle) % CLIENTS.length;
  const k = cycle - Math.floor(cycle);
  return { firing, k };
}

export function presenceFrag(steps: number): string {
  return `#version 300 es
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uReveal;
uniform vec2  uMouse;

out vec4 fragColor;

const float FOCAL = 1.7;
const vec3  HUB_COLOR    = vec3(0.063, 0.725, 0.506); // emerald-500
const vec3  CLIENT_COLOR = vec3(0.55, 0.92, 0.78);
const vec3  PULSE_COLOR  = vec3(0.78, 1.0, 0.9);

${clientsArrayGlsl()}

float sdSphere(vec3 p, float r) { return length(p) - r; }

vec3 clientPos(int i, float t) {
  float angle = CLIENT_PHASE[i] + t * CLIENT_SPEED[i] * 6.2831853;
  return vec3(cos(angle) * CLIENT_RADIUS[i], sin(angle * 0.6) * 0.4, sin(angle) * CLIENT_RADIUS[i]);
}

/* Ring pulse centred on 'center', radius growing from 0, thin shell. */
float sdRing(vec3 p, vec3 center, float radius, float thickness) {
  float d = length(p - center);
  return abs(d - radius) - thickness;
}

/* Flat expanding ring in the XZ plane (the clients' orbital plane) - reads as a
   pulse from any camera angle, unlike a full sphere which silhouettes into a
   filled disc when viewed anywhere near edge-on. */
float sdFlatRing(vec3 p, float radius, float tube) {
  vec2 q = vec2(length(p.xz) - radius, p.y);
  return length(q) - tube;
}

vec2 minMat(vec2 a, vec2 b) { return a.x < b.x ? a : b; }

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;

  float orbitT = uTime;
  float angle = 0.3 + uTime * 0.05 + uMouse.x * 0.25;
  vec3  ro = vec3(sin(angle) * 6.5, 1.6 + uMouse.y * 0.6, cos(angle) * 6.5);
  vec3  target = vec3(0.0);
  vec3  fw = normalize(target - ro);
  vec3  rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3  up = cross(rt, fw);
  vec3  rd = normalize(uv.x * rt + uv.y * up + FOCAL * fw);

  // Broadcast cycle: one client fires -> ripple to hub -> hub flashes -> ripple to all.
  float cycle = mod(uTime, ${f(CYCLE)}) / ${f(CYCLE)};
  int firing = int(mod(floor(uTime / ${f(CYCLE)}), float(CLIENT_COUNT)));
  vec3 firingPos = clientPos(firing, orbitT);

  float toHub = smoothstep(0.0, 0.35, cycle);      // client -> hub ripple window
  float hubFlash = smoothstep(0.32, 0.42, cycle) * (1.0 - smoothstep(0.5, 0.75, cycle));
  float toClients = smoothstep(0.42, 0.85, cycle);  // hub -> all clients ripple window

  vec3 col = vec3(0.0);
  float t = 0.0;
  float hitMat = 0.0; // 0 = miss, 1 = hub, 2 = client, 3 = firing client

  for (int i = 0; i < ${steps}; i++) {
    vec3 p = ro + rd * t;
    vec2 res = vec2(1e5, 0.0);

    res = minMat(res, vec2(sdSphere(p, 0.42 * uReveal + 0.02), 1.0));

    for (int c = 0; c < CLIENT_COUNT; c++) {
      vec3 cp = clientPos(c, orbitT);
      float mat = (c == firing) ? 3.0 : 2.0;
      res = minMat(res, vec2(sdSphere(p - cp, 0.16 * uReveal), mat));
    }

    // Client -> hub ripple: a shrinking ring travelling from the firing client toward the hub.
    if (toHub > 0.001 && toHub < 0.999) {
      float travel = 1.0 - toHub;
      vec3 ringCenter = mix(vec3(0.0), firingPos, travel);
      res = minMat(res, vec2(sdRing(p, ringCenter, 0.05 + toHub * 0.25, 0.012) - 0.5, 4.0));
    }

    // Hub -> all clients: an expanding ring in the clients' orbital plane. Flat
    // by construction, so it reads as a pulse from any camera angle instead of
    // silhouetting into a filled disc the way a full sphere would when viewed
    // near edge-on.
    if (toClients > 0.001 && toClients < 0.999) {
      res = minMat(res, vec2(sdFlatRing(p, toClients * 3.2, 0.02), 5.0));
    }

    // Per-material glow weight: nodes are bright points meant to read as solid;
    // the ripples are sweeping waves meant to stay subtle. shellFade ramps the
    // hub->client ring in and out across its cycle rather than snapping to full
    // brightness immediately.
    float shellFade = sin(clamp(toClients, 0.0, 1.0) * 3.14159);
    float glowWeight = res.y > 4.5 ? 0.028 * shellFade : res.y > 3.5 ? 0.018 : 0.045;
    vec3 glowColor = res.y > 3.5 ? PULSE_COLOR : res.y > 1.5 ? CLIENT_COLOR : HUB_COLOR;
    col += glowColor * exp(-res.x * 8.0) * glowWeight;
    col = min(col, vec3(2.2)); // hard ceiling: no single feature can white out the frame

    if (res.x < 0.0016) { hitMat = res.y; break; }
    t += res.x;
    if (t > 20.0) break;
  }

  if (hitMat > 0.5) {
    vec3 base = hitMat > 2.5 ? PULSE_COLOR : hitMat > 1.5 ? CLIENT_COLOR : HUB_COLOR;
    float core = hitMat < 1.5 ? (0.25 + hubFlash * 1.4) : 0.35;
    col += base * core;
  }

  col = 1.0 - exp(-col * 1.5);
  col = pow(max(col, 0.0), vec3(0.4545));

  float alpha = clamp(max(col.r, max(col.g, col.b)) * 1.3, 0.0, 1.0) * uReveal;
  fragColor = vec4(col, alpha);
}`;
}

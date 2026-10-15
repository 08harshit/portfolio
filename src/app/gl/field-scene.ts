/**
 * Hero ambient field: domain-warped contour lines that drift like data in motion.
 *
 * Deliberately restrained - it sits behind the headline and must never compete
 * with it. Three octaves of value noise plus a single warp iteration, so the pass
 * stays well under a millisecond even on integrated graphics.
 */
export function fieldFrag(octaves: number): string {
  return `#version 300 es
precision mediump float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;

out vec4 fragColor;

const vec3 ACCENT = vec3(0.063, 0.725, 0.506); // emerald-500, matching the site accent

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < ${octaves}; i++) {
    sum += noise(p) * amp;
    p = p * 2.02;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
  uv *= 1.35;

  float t = uTime * 0.045;
  vec2 parallax = uMouse * 0.12;

  // One warp iteration: cheap, but enough to turn concentric bands into flow.
  vec2 q = vec2(fbm(uv + parallax + vec2(0.0, t)), fbm(uv + vec2(3.7, 1.2) - vec2(t, 0.0)));
  float field = fbm(uv + q * 1.6 + parallax);

  // Contour lines from the scalar field. fwidth keeps them one pixel wide at any
  // resolution, so they never alias or shimmer while drifting.
  float bands = field * 9.0;
  float line = abs(fract(bands) - 0.5);
  float aa = fwidth(bands) * 1.5;
  float contour = 1.0 - smoothstep(0.0, aa, line);

  // Fade toward the edges so the field dissolves instead of ending at a hard border.
  float vignette = smoothstep(1.9, 0.35, length(uv));

  float intensity = contour * vignette * 0.6;
  intensity += smoothstep(0.55, 1.0, field) * vignette * 0.1;

  // Lift the crossings toward white so the field reads as depth rather than a
  // flat green wash, while the body stays the site's accent.
  vec3 col = mix(ACCENT, vec3(0.72, 0.95, 0.85), contour * 0.35) * intensity;
  fragColor = vec4(col, clamp(intensity, 0.0, 1.0));
}`;
}

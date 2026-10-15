/**
 * Experience timeline spine: a thin vertical glowing line that fills top-to-
 * bottom as the visitor scrolls the timeline into view, with a small pulse that
 * continuously rides the filled section so it still reads as "alive" once
 * scrolling stops.
 *
 * The line is the only thing drawn here - the role markers stay real DOM dots
 * (positioned by normal CSS layout, which varies with content height) so there
 * is no coordinate system to keep in sync between GLSL and the DOM; each dot
 * brightens independently via NodeGlowDirective when it scrolls into view.
 *
 * Not pinned - it's a read-along accent for a resume timeline, not a sequence
 * to scrub through.
 */
export function spineFrag(): string {
  return `#version 300 es
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uProgress; // 0-1: how far the fill has travelled down the spine
uniform float uReveal;   // 0-1: entrance fade-in, independent of scroll fill

out vec4 fragColor;

const vec3 DIM_COLOR   = vec3(0.149, 0.149, 0.149); // matches border token (#262626)
const vec3 LIT_COLOR   = vec3(0.063, 0.725, 0.506); // emerald-500
const vec3 PULSE_COLOR = vec3(0.65, 0.98, 0.85);

void main() {
  // The canvas is a thin vertical strip (just wide enough for the line and its
  // glow), so no camera/projection is needed: horizontal distance in raw
  // pixels from the centre column, and a 0-1 fraction down the strip.
  float aspectX = gl_FragCoord.x - uRes.x * 0.5;
  float y = 1.0 - gl_FragCoord.y / uRes.y; // flip so y=0 is the top, matching DOM order

  float lineDist = abs(aspectX);
  float core = 1.0 - smoothstep(1.1, 2.6, lineDist);
  float halo = exp(-lineDist * 0.35);

  // Soft transition right at the fill edge instead of a hard cut.
  float edge = smoothstep(uProgress - 0.02, uProgress, y);
  vec3 base = mix(LIT_COLOR, DIM_COLOR, edge);

  vec3 col = base * (core * 0.9 + halo * 0.4);

  // A small bright pulse continuously riding the filled section.
  if (uProgress > 0.02) {
    float pulseY = mod(uTime * 0.09, uProgress);
    float pd = (y - pulseY) / max(uProgress, 0.001);
    float pulse = exp(-pd * pd * 900.0) * 0.9;
    col += PULSE_COLOR * pulse * core;
  }

  float alpha = clamp(max(col.r, max(col.g, col.b)) * 1.4, 0.0, 1.0) * uReveal;
  fragColor = vec4(col, alpha);
}`;
}

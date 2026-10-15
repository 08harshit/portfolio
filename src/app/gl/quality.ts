/**
 * Quality tiering. The march step count is the dominant cost in the raymarched
 * scene, so it is chosen once up front rather than adapted per frame - a stable
 * frame time reads far better than one that visibly hunts.
 */

export interface Quality {
  /** Raymarch iterations. */
  steps: number;
  /** fBm octaves for the ambient field. */
  octaves: number;
  /** Internal render scale; the SDF is analytic so sub-native stays crisp. */
  scale: number;
}

const HIGH: Quality = { steps: 56, octaves: 3, scale: 0.75 };
const LOW: Quality = { steps: 32, octaves: 2, scale: 0.5 };

export function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function detectQuality(): Quality {
  if (typeof window === 'undefined') return LOW;

  const narrow = window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

  if (narrow || cores <= 4 || memory <= 4) return LOW;
  return HIGH;
}

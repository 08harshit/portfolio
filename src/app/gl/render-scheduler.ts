import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';

export interface RenderTarget {
  /** Element whose visibility gates rendering. */
  readonly element: Element;
  /** Minimum ms between frames. 0 = every frame, ~33 = 30fps. */
  readonly frameInterval: number;
  /** Draw one frame. `time` is seconds since the target became visible. */
  render(time: number): void;
}

interface Entry {
  target: RenderTarget;
  visible: boolean;
  lastFrame: number;
  startTime: number;
}

/**
 * One shared RAF loop for every GL surface on the page, driven outside the Angular
 * zone so frames never schedule change detection.
 *
 * The loop only exists while at least one target is on screen and the tab is
 * visible; offscreen and backgrounded surfaces cost nothing at all.
 */
@Injectable({ providedIn: 'root' })
export class RenderScheduler implements OnDestroy {
  private zone = inject(NgZone);
  private entries = new Map<RenderTarget, Entry>();
  private observer: IntersectionObserver | null = null;
  private rafId = 0;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibilityChange, { passive: true });
    }
  }

  register(target: RenderTarget): () => void {
    this.entries.set(target, {
      target,
      visible: false,
      lastFrame: 0,
      startTime: 0,
    });
    this.intersectionObserver().observe(target.element);
    return () => this.unregister(target);
  }

  private unregister(target: RenderTarget) {
    this.observer?.unobserve(target.element);
    this.entries.delete(target);
    if (this.entries.size === 0) this.stop();
  }

  private intersectionObserver(): IntersectionObserver {
    if (!this.observer) {
      this.observer = new IntersectionObserver(
        (records) => {
          for (const record of records) {
            for (const entry of this.entries.values()) {
              if (entry.target.element !== record.target) continue;
              entry.visible = record.isIntersecting;
              // Reset the clock on re-entry so animation always starts from a
              // known phase rather than jumping mid-cycle.
              if (record.isIntersecting) entry.startTime = 0;
            }
          }
          this.sync();
        },
        // Start rendering slightly before the surface scrolls into view so the
        // first visible frame is never a blank canvas.
        { rootMargin: '15% 0px' }
      );
    }
    return this.observer;
  }

  /** Force a single frame outside the loop (used for reduced-motion static renders). */
  renderOnce(target: RenderTarget, time: number) {
    target.render(time);
  }

  private hasWork(): boolean {
    if (typeof document !== 'undefined' && document.hidden) return false;
    for (const entry of this.entries.values()) {
      if (entry.visible) return true;
    }
    return false;
  }

  private sync() {
    if (this.hasWork()) {
      this.start();
    } else {
      this.stop();
    }
  }

  private onVisibilityChange = () => this.sync();

  private start() {
    if (this.rafId) return;
    this.zone.runOutsideAngular(() => {
      this.rafId = requestAnimationFrame(this.tick);
    });
  }

  private stop() {
    if (!this.rafId) return;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private tick = (now: number) => {
    this.rafId = 0;

    for (const entry of this.entries.values()) {
      if (!entry.visible) continue;
      if (now - entry.lastFrame < entry.target.frameInterval) continue;
      if (entry.startTime === 0) entry.startTime = now;
      entry.lastFrame = now;
      entry.target.render((now - entry.startTime) / 1000);
    }

    if (this.hasWork()) {
      this.zone.runOutsideAngular(() => {
        this.rafId = requestAnimationFrame(this.tick);
      });
    }
  };

  ngOnDestroy() {
    this.stop();
    this.observer?.disconnect();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
  }
}

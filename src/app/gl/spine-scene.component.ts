import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlSurface } from './gl-surface';
import { RenderScheduler, RenderTarget } from './render-scheduler';
import { spineFrag } from './spine-scene';
import { prefersReducedMotion } from './quality';

/**
 * Animated vertical timeline spine for the Experience section. Fills top-to-
 * bottom as the visitor scrolls the timeline into view, brightening each role's
 * node marker as the fill reaches it. Not pinned - it's a read-along accent
 * for a resume timeline, not a sequence to scrub through.
 */
@Component({
  selector: 'app-spine-scene',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <canvas
      #canvas
      class="block h-full w-full transition-opacity duration-700"
      [class.opacity-0]="!ready()"
      aria-hidden="true"
    ></canvas>
  `,
  styles: [':host { display: block; }'],
})
export class SpineSceneComponent implements AfterViewInit, OnDestroy, RenderTarget {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  /** Wrapper whose scroll position through the viewport drives the fill. */
  @Input({ required: true }) driver!: HTMLElement;

  private zone = inject(NgZone);
  private scheduler = inject(RenderScheduler);

  readonly ready = signal(false);
  readonly frameInterval = 0;

  private surface: GlSurface | null = null;
  private unregister: (() => void) | null = null;
  private progress = 0;
  private targetProgress = 0;
  private reveal = 0;

  get element(): Element {
    return this.canvasRef.nativeElement;
  }

  ngAfterViewInit() {
    // A high internal scale relative to CSS width: the canvas is only a few CSS
    // pixels wide, so even a "full quality" backing store here costs nothing -
    // this isn't gated by detectQuality() the way the wide scenes are.
    const surface = GlSurface.create(this.canvasRef.nativeElement, spineFrag(), 1);
    if (!surface) return;
    this.surface = surface;

    if (prefersReducedMotion()) {
      surface.onResize = () => this.draw(0, 1, 1);
      this.draw(0, 1, 1);
      this.ready.set(true);
      return;
    }

    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });
    });

    this.onScroll();
    this.progress = this.targetProgress;
    this.unregister = this.scheduler.register(this);
    this.ready.set(true);
  }

  render(time: number) {
    this.progress += (this.targetProgress - this.progress) * 0.1;
    this.reveal = Math.min(1, this.reveal + 0.04);
    this.draw(time, this.progress, this.reveal);
  }

  private draw(time: number, progress: number, reveal: number) {
    const surface = this.surface;
    if (!surface) return;
    surface.render({
      uRes: [surface.width, surface.height],
      uTime: time,
      uProgress: progress,
      uReveal: reveal,
    });
  }

  /**
   * Progress is how far a point near the top of the viewport has travelled
   * down the driver's own height - reads top-to-bottom in step with scrolling,
   * independent of viewport size or where the section sits on the page.
   */
  private onScroll = () => {
    const rect = this.driver.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const reference = vh * 0.35;
    this.targetProgress = clamp((reference - rect.top) / Math.max(1, rect.height), 0, 1);
  };

  ngOnDestroy() {
    this.unregister?.();
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    this.surface?.dispose();
    this.surface = null;
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

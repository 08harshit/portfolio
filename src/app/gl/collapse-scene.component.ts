import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlSurface } from './gl-surface';
import { RenderScheduler, RenderTarget } from './render-scheduler';
import { collapseFrag } from './collapse-scene';
import { detectQuality, prefersReducedMotion } from './quality';

const SHARDS_HIGH = 22;
const SHARDS_LOW = 12;

/** Mirrors collapseK() in collapse-scene.ts so the DOM caption swap lines up with the GPU-side cycle. */
function collapseK(time: number): number {
  const cycle = (time % 6) / 6;
  const smooth = (edge0: number, edge1: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  };
  return smooth(0.08, 0.55, cycle);
}

/**
 * Payload optimization scene: a dim 1.4MB slab collapses into a bright 10KB
 * block, shedding fragments as it goes. Loops continuously - the "before" state
 * needs to keep reappearing for the transformation to read as a transformation
 * rather than a one-off intro animation.
 */
@Component({
  selector: 'app-collapse-scene',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #root class="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-auto lg:h-[26rem]">
      <canvas
        #canvas
        class="absolute inset-0 h-full w-full transition-opacity duration-700"
        [class.opacity-0]="!ready()"
        aria-hidden="true"
      ></canvas>

      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-between py-6" [class.opacity-0]="!ready()">
        <div #beforeCaption class="text-center" style="opacity: 1">
          <div class="font-mono text-[11px] uppercase tracking-[0.14em] text-red-400">1.4 MB payload</div>
          <div class="font-mono text-[10px] text-foreground/40">~800ms response</div>
        </div>
        <div #afterCaption class="text-center" style="opacity: 0">
          <div class="font-mono text-[11px] uppercase tracking-[0.14em] text-emerald-400">10 KB payload</div>
          <div class="font-mono text-[10px] text-foreground/40">~80ms response</div>
        </div>
      </div>

      <div *ngIf="failed()" class="absolute inset-0">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class CollapseSceneComponent implements AfterViewInit, OnDestroy, RenderTarget {
  @ViewChild('root', { static: true }) private rootRef!: ElementRef<HTMLElement>;
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('beforeCaption', { static: true }) private beforeRef!: ElementRef<HTMLElement>;
  @ViewChild('afterCaption', { static: true }) private afterRef!: ElementRef<HTMLElement>;

  private zone = inject(NgZone);
  private scheduler = inject(RenderScheduler);

  readonly ready = signal(false);
  readonly failed = signal(false);
  readonly frameInterval = 0;

  private surface: GlSurface | null = null;
  private unregister: (() => void) | null = null;
  private reveal = 0;
  private mouse = { x: 0, y: 0 };
  private targetMouse = { x: 0, y: 0 };
  private lastCaptionWrite = 0;

  get element(): Element {
    return this.rootRef.nativeElement;
  }

  ngAfterViewInit() {
    const quality = detectQuality();
    const shards = quality.steps >= 56 ? SHARDS_HIGH : SHARDS_LOW;
    const surface = GlSurface.create(
      this.canvasRef.nativeElement,
      collapseFrag(quality.steps, shards),
      quality.scale
    );
    if (!surface) {
      this.failed.set(true);
      return;
    }
    this.surface = surface;

    if (prefersReducedMotion()) {
      // Freeze mid-collapse so both the "before" mass and the "after" glow are
      // visible in a single static frame.
      surface.onResize = () => this.draw(2.0, 1);
      this.draw(2.0, 1);
      this.beforeRef.nativeElement.style.opacity = '0.5';
      this.afterRef.nativeElement.style.opacity = '0.5';
      this.ready.set(true);
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.rootRef.nativeElement.addEventListener('pointermove', this.onPointerMove, {
        passive: true,
      });
    });

    this.unregister = this.scheduler.register(this);
    this.ready.set(true);
  }

  render(time: number) {
    this.reveal = Math.min(1, this.reveal + 0.02);
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
    this.draw(time, this.reveal);

    // Direct style writes, not a signal - render() runs outside the Angular
    // zone (see RenderScheduler), and this app is zone-based rather than
    // zoneless, so a signal write here has no reliable path to a CD run.
    // Throttled since the crossfade only needs a few updates a second.
    if (time - this.lastCaptionWrite > 0.08) {
      this.lastCaptionWrite = time;
      const k = collapseK(time);
      this.beforeRef.nativeElement.style.opacity = String(1 - k);
      this.afterRef.nativeElement.style.opacity = String(k);
    }
  }

  private draw(time: number, reveal: number) {
    const surface = this.surface;
    if (!surface) return;
    surface.render({
      uRes: [surface.width, surface.height],
      uTime: time,
      uReveal: reveal,
      uMouse: [this.mouse.x, this.mouse.y],
    });
  }

  private onPointerMove = (event: PointerEvent) => {
    const rect = this.rootRef.nativeElement.getBoundingClientRect();
    this.targetMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.targetMouse.y = ((event.clientY - rect.top) / rect.height) * -2 + 1;
  };

  ngOnDestroy() {
    this.unregister?.();
    this.rootRef?.nativeElement.removeEventListener('pointermove', this.onPointerMove);
    this.surface?.dispose();
    this.surface = null;
  }
}

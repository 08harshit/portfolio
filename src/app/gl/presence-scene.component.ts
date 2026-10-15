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
import { presenceFrag } from './presence-scene';
import { detectQuality, prefersReducedMotion } from './quality';

/**
 * WebSocket collaboration scene: a gateway hub with orbiting clients, one of
 * which "fires" each cycle and broadcasts to the rest. Ambient, not scroll-
 * scrubbed - it settles in once on scroll-into-view (uReveal 0->1) and then
 * loops on its own, because the point being made is about live behaviour over
 * time, not a sequence to step through.
 */
@Component({
  selector: 'app-presence-scene',
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

      <div class="pointer-events-none absolute inset-0" [class.opacity-0]="!ready()">
        <div
          class="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-6 whitespace-nowrap text-center"
        >
          <div class="font-mono text-[11px] uppercase tracking-[0.14em] text-emerald-400">
            Socket.IO Gateway
          </div>
        </div>
      </div>

      <div *ngIf="failed()" class="absolute inset-0">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PresenceSceneComponent implements AfterViewInit, OnDestroy, RenderTarget {
  @ViewChild('root', { static: true }) private rootRef!: ElementRef<HTMLElement>;
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

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

  get element(): Element {
    return this.rootRef.nativeElement;
  }

  ngAfterViewInit() {
    const quality = detectQuality();
    const surface = GlSurface.create(
      this.canvasRef.nativeElement,
      presenceFrag(quality.steps),
      quality.scale
    );
    if (!surface) {
      this.failed.set(true);
      return;
    }
    this.surface = surface;

    if (prefersReducedMotion()) {
      // A live broadcast loop is inherently motion; freeze on a representative
      // mid-cycle frame instead of animating it.
      surface.onResize = () => this.draw(1.4, 1);
      this.draw(1.4, 1);
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
    // Ramps once from 0 to 1 and stays there; RenderScheduler restarts `time`
    // from 0 on every re-entry into view, which naturally replays the broadcast
    // cycle from the top without needing to touch `reveal` again.
    this.reveal = Math.min(1, this.reveal + 0.02);
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
    this.draw(time, this.reveal);
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

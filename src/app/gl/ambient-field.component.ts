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
import { fieldFrag } from './field-scene';
import { detectQuality, prefersReducedMotion } from './quality';

/**
 * Ambient drifting contour field behind the hero copy.
 *
 * Throttled to 30fps: the field moves slowly enough that 60 would be spending
 * twice the power for a difference nobody can perceive.
 */
@Component({
  selector: 'app-ambient-field',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <canvas
      #canvas
      class="h-full w-full transition-opacity duration-1000"
      [class.opacity-0]="!ready()"
      aria-hidden="true"
    ></canvas>
  `,
  styles: [':host { display: block; }'],
})
export class AmbientFieldComponent implements AfterViewInit, OnDestroy, RenderTarget {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  private zone = inject(NgZone);
  private scheduler = inject(RenderScheduler);

  readonly ready = signal(false);
  readonly frameInterval = 33;

  private surface: GlSurface | null = null;
  private unregister: (() => void) | null = null;
  private mouse = { x: 0, y: 0 };
  private targetMouse = { x: 0, y: 0 };

  get element(): Element {
    return this.canvasRef.nativeElement;
  }

  ngAfterViewInit() {
    const quality = detectQuality();
    const surface = GlSurface.create(
      this.canvasRef.nativeElement,
      fieldFrag(quality.octaves),
      quality.scale
    );
    if (!surface) return;
    this.surface = surface;

    if (prefersReducedMotion()) {
      surface.onResize = () => this.draw(0);
      this.draw(0);
      this.ready.set(true);
      return;
    }

    this.zone.runOutsideAngular(() => {
      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    });

    this.unregister = this.scheduler.register(this);
    this.ready.set(true);
  }

  render(time: number) {
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.04;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.04;
    this.draw(time);
  }

  private draw(time: number) {
    const surface = this.surface;
    if (!surface) return;
    surface.render({
      uRes: [surface.width, surface.height],
      uTime: time,
      uMouse: [this.mouse.x, this.mouse.y],
    });
  }

  private onPointerMove = (event: PointerEvent) => {
    this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = (event.clientY / window.innerHeight) * -2 + 1;
  };

  ngOnDestroy() {
    this.unregister?.();
    window.removeEventListener('pointermove', this.onPointerMove);
    this.surface?.dispose();
    this.surface = null;
  }
}

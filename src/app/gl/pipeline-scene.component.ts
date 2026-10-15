import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlSurface } from './gl-surface';
import { RenderScheduler, RenderTarget } from './render-scheduler';
import { NODES, camera, pipelineFrag, projectNode } from './pipeline-scene';
import { Quality, detectQuality, prefersReducedMotion } from './quality';

@Component({
  selector: 'app-pipeline-scene',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #root class="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-auto lg:h-[68vh]">
      <canvas
        #canvas
        class="absolute inset-0 h-full w-full transition-opacity duration-700"
        [class.opacity-0]="!ready()"
        aria-hidden="true"
      ></canvas>

      <!-- Captions stay real DOM text: selectable, accessible and indexable,
           and they cost no draw calls. -->
      <div class="pointer-events-none absolute inset-0" [class.opacity-0]="!ready()">
        <div
          #nodeLabel
          *ngFor="let node of nodes"
          class="absolute left-0 top-0 whitespace-nowrap text-center will-change-transform"
          style="opacity: 0"
        >
          <div class="font-mono text-[11px] uppercase tracking-[0.14em]" [ngClass]="node.tone">
            {{ node.label }}
          </div>
          <div class="font-mono text-[10px] text-foreground/40">{{ node.detail }}</div>
        </div>
      </div>

      <!-- Rendered only when WebGL2 is unavailable. -->
      <div *ngIf="failed()" class="absolute inset-0">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PipelineSceneComponent implements AfterViewInit, OnDestroy, RenderTarget {
  @ViewChild('root', { static: true }) private rootRef!: ElementRef<HTMLElement>;
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChildren('nodeLabel') private labelRefs!: QueryList<ElementRef<HTMLElement>>;

  private zone = inject(NgZone);
  private scheduler = inject(RenderScheduler);

  /**
   * The tall, pinned wrapper whose scroll travel drives progress. Without it the
   * animation would be tied to the canvas crossing the viewport, which finishes
   * the sequence exactly as the panel leaves the screen.
   */
  @Input() driver: HTMLElement | null = null;

  readonly nodes = NODES;
  readonly ready = signal(false);
  readonly failed = signal(false);

  readonly frameInterval = 0;

  private surface: GlSurface | null = null;
  private quality: Quality = detectQuality();
  private unregister: (() => void) | null = null;

  private progress = 0;
  private targetProgress = 0;
  private mouse = { x: 0, y: 0 };
  private targetMouse = { x: 0, y: 0 };

  get element(): Element {
    return this.rootRef.nativeElement;
  }

  ngAfterViewInit() {
    const surface = GlSurface.create(
      this.canvasRef.nativeElement,
      pipelineFrag(this.quality.steps),
      this.quality.scale
    );

    if (!surface) {
      this.failed.set(true);
      return;
    }
    this.surface = surface;

    if (prefersReducedMotion()) {
      // Still show the finished diagram - just never animate it.
      surface.onResize = () => this.drawStatic();
      this.drawStatic();
      this.ready.set(true);
      return;
    }

    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });
      this.rootRef.nativeElement.addEventListener('pointermove', this.onPointerMove, {
        passive: true,
      });
    });

    this.onScroll();
    this.progress = this.targetProgress;
    this.unregister = this.scheduler.register(this);
    this.ready.set(true);
  }

  /** Single frame at full progress, for reduced-motion visitors. */
  private drawStatic() {
    if (!this.surface) return;
    this.progress = 1;
    this.mouse = { x: 0, y: 0 };
    this.draw(0);
  }

  render(time: number) {
    // Approach the scroll target and the pointer with a frame-rate independent
    // ease, so a 30fps device travels the same arc as a 144fps one.
    const k = 0.12;
    this.progress += (this.targetProgress - this.progress) * k;
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.06;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.06;
    this.draw(time);
  }

  private draw(time: number) {
    const surface = this.surface;
    if (!surface) return;

    surface.render({
      uRes: [surface.width, surface.height],
      uTime: time,
      uProgress: this.progress,
      uMouse: [this.mouse.x, this.mouse.y],
    });

    this.positionLabels();
  }

  /**
   * Projects each node with the same camera the shader uses, then writes the
   * result straight to style - no change detection involved.
   */
  private positionLabels() {
    const surface = this.surface;
    const labels = this.labelRefs;
    if (!surface || !labels) return;

    const [cssWidth, cssHeight] = surface.cssSize;
    if (cssWidth === 0) return;

    const cam = camera(this.progress, this.mouse.x, this.mouse.y);

    labels.forEach((ref, index) => {
      const node = this.nodes[index];
      const el = ref.nativeElement;
      const projected = projectNode(node.pos, cam, cssWidth, cssHeight);

      if (!projected) {
        el.style.opacity = '0';
        return;
      }

      const [start, end] = node.reveal;
      const reveal = smoothstep(start, end, this.progress);
      el.style.opacity = String(reveal);

      // Anchor the caption's near edge to the node rather than its centre, so it
      // clears the geometry no matter how large the node projects. The branch
      // pair reads outward left/right, keeping the vertical lane clear.
      let dx = 0;
      let dy = 0;
      let shift = 'translate(-50%, -50%)';
      switch (node.anchor) {
        case 'above':
          dy = -node.offset;
          shift = 'translate(-50%, -100%)';
          break;
        case 'below':
          dy = node.offset;
          shift = 'translate(-50%, 0%)';
          break;
        case 'left':
          dx = -node.offset;
          shift = 'translate(-100%, -50%)';
          el.style.textAlign = 'right';
          break;
        case 'right':
          dx = node.offset;
          shift = 'translate(0%, -50%)';
          el.style.textAlign = 'left';
          break;
      }
      el.style.transform = `translate3d(${projected.x + dx}px, ${projected.y + dy}px, 0) ${shift}`;
    });
  }

  /**
   * Reads layout once per scroll event, never during the style writes in
   * positionLabels(), so the two never interleave into a thrash.
   */
  private onScroll = () => {
    const vh = window.innerHeight || 1;

    if (this.driver) {
      // Pinned: the sticky child is parked while the tall wrapper scrolls past,
      // so progress is simply how far through that travel we are.
      const rect = this.driver.getBoundingClientRect();
      const travel = Math.max(1, rect.height - vh);
      this.targetProgress = clamp(-rect.top / travel, 0, 1);
      return;
    }

    const rect = this.rootRef.nativeElement.getBoundingClientRect();
    const travel = rect.height + vh * 0.6;
    this.targetProgress = clamp((vh * 0.8 - rect.top) / travel, 0, 1);
  };

  private onPointerMove = (event: PointerEvent) => {
    const rect = this.rootRef.nativeElement.getBoundingClientRect();
    this.targetMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.targetMouse.y = ((event.clientY - rect.top) / rect.height) * -2 + 1;
  };

  ngOnDestroy() {
    this.unregister?.();
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    this.rootRef?.nativeElement.removeEventListener('pointermove', this.onPointerMove);
    this.surface?.dispose();
    this.surface = null;
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1), 0, 1);
  return t * t * (3 - 2 * t);
}

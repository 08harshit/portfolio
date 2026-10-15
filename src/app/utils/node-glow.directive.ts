import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';

/**
 * Brightens a timeline node dot from the dim "not yet reached" border colour to
 * the emerald "reached" colour, with a brief pulse, when it scrolls into view -
 * paired with app-spine-scene's animated fill line, but driven independently
 * via IntersectionObserver (same mechanism as ScrollRevealDirective) rather
 * than trying to keep a shared coordinate system with the canvas.
 */
@Directive({
  selector: '[appNodeGlow]',
  standalone: true,
})
export class NodeGlowDirective implements OnInit, OnDestroy {
  private observer!: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngOnInit() {
    const node = this.el.nativeElement;
    this.renderer.setStyle(node, 'transition', 'background-color 400ms ease, box-shadow 400ms ease');

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          this.renderer.setStyle(node, 'background-color', '#10b981'); // emerald-500
          this.renderer.setStyle(node, 'box-shadow', '0 0 0 4px #050505, 0 0 12px 2px rgba(16,185,129,0.6)');
          this.observer.unobserve(node);
        }
      },
      { rootMargin: '0px 0px -40% 0px', threshold: 0.3 }
    );
    this.observer.observe(node);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}

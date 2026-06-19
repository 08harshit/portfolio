import { Directive, ElementRef, OnInit, OnDestroy, Input, Renderer2, numberAttribute } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input({ transform: numberAttribute }) delay: number = 0;
  @Input({ transform: numberAttribute }) duration: number = 700;
  @Input() distance: string = '30px';
  @Input() direction: 'up' | 'down' | 'left' | 'right' | 'none' = 'up';

  private observer!: IntersectionObserver;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.setupInitialStyles();
    this.setupObserver();
  }

  private setupInitialStyles() {
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
    this.renderer.setStyle(this.el.nativeElement, 'transition', `all ${this.duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${this.delay}ms`);
    
    let transform = '';
    switch (this.direction) {
      case 'up': transform = `translateY(${this.distance})`; break;
      case 'down': transform = `translateY(-${this.distance})`; break;
      case 'left': transform = `translateX(${this.distance})`; break;
      case 'right': transform = `translateX(-${this.distance})`; break;
      case 'none': transform = 'none'; break;
    }
    
    this.renderer.setStyle(this.el.nativeElement, 'transform', transform);
  }

  private setupObserver() {
    const options = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
          this.renderer.setStyle(this.el.nativeElement, 'transform', 'translate(0, 0)');
          this.observer.unobserve(this.el.nativeElement); // Only animate once
        }
      });
    }, options);

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

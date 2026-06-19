import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appMagnetic]',
  standalone: true
})
export class MagneticDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    
    // Move element slightly towards the mouse
    this.renderer.setStyle(this.el.nativeElement, 'transform', `translate(${x * 0.2}px, ${y * 0.2}px)`);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    // Reset transform when mouse leaves
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translate(0px, 0px)');
  }
}

import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cursor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed top-0 left-0 w-6 h-6 rounded-full border border-emerald-500/50 pointer-events-none z-[100] transition-all duration-150 ease-out hidden md:flex items-center justify-center mix-blend-difference"
      [style.transform]="'translate3d(' + (x - 12) + 'px, ' + (y - 12) + 'px, 0) scale(' + scale + ')'"
      [style.opacity]="opacity"
    >
      <div class="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
    </div>
  `
})
export class CursorComponent implements OnInit {
  x = -100;
  y = -100;
  scale = 1;
  opacity = 0;
  private isHovering = false;

  ngOnInit() {
    // Detect hoverable elements dynamically
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button' || target.closest('a') || target.closest('button')) {
        this.scale = 2;
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button' || target.closest('a') || target.closest('button')) {
        this.scale = 1;
      }
    });
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.x = e.clientX;
    this.y = e.clientY;
    this.opacity = 1;
  }
  
  @HostListener('document:mouseleave', ['$event'])
  onMouseLeave() {
    this.opacity = 0;
  }
}

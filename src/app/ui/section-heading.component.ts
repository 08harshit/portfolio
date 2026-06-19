import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-heading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="['mb-12 flex flex-col', align === 'center' ? 'items-center text-center' : '', customClass]">
      <h2 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
        {{ title }}
      </h2>
      <p *ngIf="subtitle" class="text-foreground/70 text-lg max-w-[800px]">
        {{ subtitle }}
      </p>
      <div *ngIf="withDivider" class="h-1 w-20 bg-foreground/20 rounded mt-6"></div>
    </div>
  `
})
export class SectionHeadingComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() align: 'left' | 'center' = 'left';
  @Input() withDivider: boolean = false;
  @Input() customClass: string = '';
}

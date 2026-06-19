import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [ngClass]="[
        'rounded-xl border border-border bg-surface text-foreground shadow-sm transition-all duration-300',
        hoverEffect ? 'hover:border-border/80 hover:shadow-md hover:-translate-y-1' : '',
        customClass
      ]"
    >
      <!-- Card Header -->
      <div *ngIf="title || subtitle" class="flex flex-col space-y-1.5 p-6">
        <h3 *ngIf="title" class="font-semibold leading-none tracking-tight">{{ title }}</h3>
        <p *ngIf="subtitle" class="text-sm text-foreground/70">{{ subtitle }}</p>
      </div>
      
      <!-- Card Content -->
      <div [ngClass]="['p-6 pt-0', contentClass]">
        <ng-content></ng-content>
      </div>
      
      <!-- Card Footer -->
      <div *ngIf="hasFooter" class="flex items-center p-6 pt-0">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() customClass: string = '';
  @Input() contentClass: string = '';
  @Input() hoverEffect: boolean = false;
  @Input() hasFooter: boolean = false;
}

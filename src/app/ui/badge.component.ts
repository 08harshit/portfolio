import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [ngClass]="[
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        getVariantClasses(),
        customClass
      ]"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class BadgeComponent {
  @Input() variant: 'default' | 'secondary' | 'outline' = 'default';
  @Input() customClass: string = '';

  getVariantClasses(): string {
    switch (this.variant) {
      case 'default':
        return 'border-transparent bg-foreground text-background hover:bg-foreground/80';
      case 'secondary':
        return 'border-transparent bg-surface hover:bg-surface-hover text-foreground';
      case 'outline':
        return 'text-foreground border-border hover:bg-surface-hover';
      default:
        return '';
    }
  }
}

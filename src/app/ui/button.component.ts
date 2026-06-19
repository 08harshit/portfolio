import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MagneticDirective } from '../utils/magnetic.directive';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MagneticDirective],
  template: `
    <button
      appMagnetic
      [ngClass]="[
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        getVariantClasses(),
        getSizeClasses(),
        customClass
      ]"
      [disabled]="disabled"
      (click)="onClick($event)"
    >
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary';
  @Input() size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
  @Input() customClass: string = '';
  @Input() disabled: boolean = false;

  getVariantClasses(): string {
    switch (this.variant) {
      case 'primary':
        return 'bg-foreground text-background hover:bg-foreground/90';
      case 'secondary':
        return 'bg-surface text-foreground hover:bg-surface-hover';
      case 'outline':
        return 'border border-border bg-background hover:bg-surface-hover hover:text-foreground';
      case 'ghost':
        return 'hover:bg-surface-hover hover:text-foreground';
      default:
        return '';
    }
  }

  getSizeClasses(): string {
    switch (this.size) {
      case 'default':
        return 'h-10 px-4 py-2';
      case 'sm':
        return 'h-9 rounded-md px-3';
      case 'lg':
        return 'h-11 rounded-md px-8';
      case 'icon':
        return 'h-10 w-10';
      default:
        return '';
    }
  }

  onClick(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}

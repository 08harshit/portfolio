import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../ui/card.component';
import { ScrollRevealDirective } from '../utils/scroll-reveal.directive';

@Component({
  selector: 'app-impact',
  standalone: true,
  imports: [CommonModule, CardComponent, ScrollRevealDirective],
  template: `
    <section class="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/50">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <app-card 
          *ngFor="let metric of metrics; let i = index" 
          [hoverEffect]="true"
          appScrollReveal 
          [delay]="i * 100"
          customClass="bg-surface/50 backdrop-blur-sm border-border/50"
        >
          <div class="flex flex-col h-full space-y-4">
            <h3 class="text-4xl lg:text-5xl font-bold tracking-tighter text-foreground font-mono">
              {{ metric.value }}
            </h3>
            <div class="space-y-1 mt-auto">
              <p class="font-semibold text-foreground/90">{{ metric.title }}</p>
              <p class="text-sm text-foreground/60">{{ metric.description }}</p>
            </div>
          </div>
        </app-card>

      </div>
    </section>
  `
})
export class ImpactComponent {
  metrics = [
    {
      value: '95%',
      title: 'Payload Reduction',
      description: 'Optimized API responses from 1.4 MB down to 10 KB using advanced PostgreSQL aggregations.'
    },
    {
      value: '50-90%',
      title: 'Performance Boost',
      description: 'Faster API response times across analytical dashboards by moving computation to the database layer.'
    },
    {
      value: 'Real-Time',
      title: 'Collaboration',
      description: 'Built scalable WebSocket infrastructure with Socket.IO and Redis Pub/Sub.'
    },
    {
      value: 'Enterprise',
      title: 'Scale Systems',
      description: 'Successfully delivered multiple high-impact production features for enterprise clients.'
    }
  ];
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeadingComponent } from '../ui/section-heading.component';
import { ScrollRevealDirective } from '../utils/scroll-reveal.directive';

@Component({
  selector: 'app-philosophy',
  standalone: true,
  imports: [CommonModule, SectionHeadingComponent, ScrollRevealDirective],
  template: `
    <section class="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/50">
      <app-section-heading 
        appScrollReveal
        title="Engineering Philosophy" 
        subtitle="The core principles that guide my architectural decisions."
        align="center">
      </app-section-heading>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
        <div *ngFor="let principle of principles; let i = index" 
             appScrollReveal 
             [delay]="i * 100"
             class="group p-8 border border-border/50 rounded-2xl hover:bg-surface transition-colors">
          <div class="text-4xl font-serif text-foreground/20 mb-4 group-hover:text-foreground/40 transition-colors">0{{ i + 1 }}</div>
          <h3 class="text-2xl font-bold mb-3 tracking-tight">{{ principle.title }}</h3>
          <p class="text-foreground/70 leading-relaxed">{{ principle.description }}</p>
        </div>
      </div>
    </section>
  `
})
export class PhilosophyComponent {
  principles = [
    {
      title: 'Build systems that scale.',
      description: 'Design for the future but implement for today. Horizontal scalability should be an architectural foundation, not an afterthought.'
    },
    {
      title: 'Measure before optimizing.',
      description: 'Premature optimization is the root of all evil. Use profiling, metrics, and real-world data to identify actual bottlenecks.'
    },
    {
      title: 'Keep architectures simple.',
      description: 'Complexity is a liability. Strive for elegant, straightforward solutions that are easy to reason about and maintain.'
    },
    {
      title: 'Performance is a feature.',
      description: 'Speed matters. Every millisecond counts when building enterprise-grade applications and real-time collaboration tools.'
    },
    {
      title: 'Developer experience matters.',
      description: 'Code is read far more often than it is written. Write clean, documented, and testable code that empowers the team.'
    },
    {
      title: 'Reliability beats cleverness.',
      description: 'Boring technology that works is better than bleeding-edge tech that breaks. Prioritize robust, resilient, and fault-tolerant systems.'
    }
  ];
}

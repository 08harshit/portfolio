import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeadingComponent } from '../ui/section-heading.component';
import { BadgeComponent } from '../ui/badge.component';
import { ScrollRevealDirective } from '../utils/scroll-reveal.directive';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, SectionHeadingComponent, BadgeComponent, ScrollRevealDirective],
  template: `
    <section class="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/50 bg-surface/30">
      <app-section-heading 
        appScrollReveal
        title="Technical Arsenal" 
        subtitle="Tools and technologies I use to build scalable systems."
        align="center">
      </app-section-heading>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
        
        <div *ngFor="let category of skillCategories; let i = index" 
             appScrollReveal 
             [delay]="i * 100"
             class="bg-background border border-border rounded-xl p-8 shadow-sm">
          <h3 class="text-xl font-semibold mb-6 flex items-center gap-3">
            <span class="w-8 h-px bg-foreground/20"></span>
            {{ category.name }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <app-badge variant="secondary" *ngFor="let skill of category.skills">{{ skill }}</app-badge>
          </div>
        </div>

      </div>
    </section>
  `
})
export class SkillsComponent {
  skillCategories = [
    {
      name: 'Backend',
      skills: ['NestJS', 'Node.js', 'Express.js', 'PostgreSQL', 'MongoDB', 'Redis', 'Kafka']
    },
    {
      name: 'Frontend',
      skills: ['Angular', 'TypeScript', 'RxJS', 'Akita', 'AG Grid']
    },
    {
      name: 'Realtime',
      skills: ['Socket.IO', 'WebSockets', 'Redis Pub/Sub']
    },
    {
      name: 'Infrastructure',
      skills: ['Docker', 'Nginx', 'Linux', 'CI/CD']
    },
    {
      name: 'Cloud & Data',
      skills: ['BigQuery', 'API Design', 'System Architecture']
    }
  ];
}

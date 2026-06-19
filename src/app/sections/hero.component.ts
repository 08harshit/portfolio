import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../ui/button.component';
import { BadgeComponent } from '../ui/badge.component';
import { ScrollRevealDirective } from '../utils/scroll-reveal.directive';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, BadgeComponent, ScrollRevealDirective],
  template: `
    <section class="min-h-[90vh] flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="space-y-8 max-w-4xl">
        <div appScrollReveal [delay]="100" class="inline-flex items-center space-x-2">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span class="text-sm font-mono tracking-wide text-foreground/80">AVAILABLE FOR NEW OPPORTUNITIES</span>
        </div>

        <h1 appScrollReveal [delay]="200" class="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 leading-[1.1] pb-2">
          Hi, I'm Harshit. <br />
          <span class="text-foreground/50">I build scalable backend systems.</span>
        </h1>

        <p appScrollReveal [delay]="300" class="text-xl sm:text-2xl text-foreground/70 max-w-2xl leading-relaxed">
          Full Stack Developer with 2+ years of experience building performant systems using NestJS, PostgreSQL, Redis, Angular, Docker, and modern cloud technologies.
        </p>

        <div appScrollReveal [delay]="400" class="flex flex-wrap gap-4 pt-4">
          <a routerLink="/" fragment="work"><app-button size="lg">View Case Studies</app-button></a>
          <a href="/Harshit_Sen_CV.pdf" download="Harshit_Sen_CV.pdf" target="_blank"><app-button variant="outline" size="lg">Download Resume</app-button></a>
        </div>

        <div appScrollReveal [delay]="500" class="pt-12">
          <p class="text-sm font-mono text-foreground/50 mb-4">CORE TECHNOLOGIES</p>
          <div class="flex flex-wrap gap-3">
            <app-badge variant="secondary" *ngFor="let tech of technologies">{{ tech }}</app-badge>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HeroComponent {
  technologies = [
    'NestJS', 'Node.js', 'PostgreSQL', 'Redis', 'Angular', 
    'TypeScript', 'Docker', 'Socket.IO', 'Kafka'
  ];
}

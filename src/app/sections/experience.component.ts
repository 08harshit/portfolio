import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeadingComponent } from '../ui/section-heading.component';
import { ScrollRevealDirective } from '../utils/scroll-reveal.directive';
import { NodeGlowDirective } from '../utils/node-glow.directive';
import { SpineSceneComponent } from '../gl/spine-scene.component';
import { BadgeComponent } from '../ui/badge.component';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [
    CommonModule,
    SectionHeadingComponent,
    ScrollRevealDirective,
    NodeGlowDirective,
    SpineSceneComponent,
    BadgeComponent
  ],
  template: `
    <section class="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <app-section-heading
        appScrollReveal
        title="Experience"
        [withDivider]="true">
      </app-section-heading>

      <div class="mt-12 space-y-12">

        <div #timeline class="relative pl-8 sm:pl-0" appScrollReveal delay="100">
          <div class="hidden sm:block absolute left-[50%] top-0 bottom-0 w-4 -translate-x-1/2">
            <app-spine-scene [driver]="timeline" class="block h-full w-full"></app-spine-scene>
          </div>

          <!-- Freelance (current) -->
          <div class="relative sm:flex items-center justify-between mb-16">
            <div appNodeGlow class="hidden sm:block absolute left-[50%] w-3 h-3 bg-border rounded-full -translate-x-1/2 ring-4 ring-background"></div>

            <div class="sm:w-[45%] text-left sm:text-right mb-4 sm:mb-0">
              <h3 class="text-xl font-bold">Freelance Full Stack Developer</h3>
              <p class="text-foreground/70 font-mono text-sm mt-1">June 2026 – Present</p>
            </div>

            <div class="sm:w-[45%] bg-surface border border-border rounded-xl p-6 shadow-sm">
              <h4 class="font-semibold text-lg mb-2">Independent</h4>
              <ul class="space-y-2 text-foreground/80 text-sm list-disc list-inside">
                <li>Designing and shipping backend systems and full-stack platforms for clients.</li>
                <li>Owning architecture, delivery, and client communication end-to-end.</li>
              </ul>

              <div class="mt-5 pt-5 border-t border-border/50 space-y-3">
                <p class="text-xs font-mono text-foreground/40 tracking-wide">CURRENTLY BUILDING</p>

                <div class="flex items-center justify-between gap-3">
                  <span class="text-sm text-foreground/80">Real estate platform</span>
                  <app-badge variant="outline" customClass="text-emerald-400 border-emerald-400/30 shrink-0">Shipped</app-badge>
                </div>

                <div class="flex items-center justify-between gap-3">
                  <span class="text-sm text-foreground/80">Hyperlocal e-commerce app</span>
                  <app-badge variant="outline" customClass="text-amber-400 border-amber-400/30 shrink-0">In Progress</app-badge>
                </div>
              </div>
            </div>
          </div>

          <!-- Full-time Role -->
          <div class="relative sm:flex items-center justify-between mb-16 flex-row-reverse">
            <div appNodeGlow class="hidden sm:block absolute left-[50%] w-3 h-3 bg-border rounded-full -translate-x-1/2 ring-4 ring-background"></div>

            <div class="sm:w-[45%] text-left mb-4 sm:mb-0">
              <h3 class="text-xl font-bold">Full Stack Developer</h3>
              <p class="text-foreground/70 font-mono text-sm mt-1">August 2024 – June 2026</p>
            </div>

            <div class="sm:w-[45%] bg-surface border border-border rounded-xl p-6 shadow-sm">
              <h4 class="font-semibold text-lg mb-2">Wisflux Tech Labs</h4>
              <ul class="space-y-2 text-foreground/80 text-sm list-disc list-inside">
                <li>Built real-time collaboration systems.</li>
                <li>Developed high-performance NestJS APIs.</li>
                <li>Designed complex PostgreSQL aggregation queries.</li>
                <li>Implemented scalable backend services using Redis.</li>
                <li>Delivered critical production features.</li>
              </ul>
            </div>
          </div>

          <!-- Intern Role -->
          <div class="relative sm:flex items-center justify-between">
            <div appNodeGlow class="hidden sm:block absolute left-[50%] w-3 h-3 bg-border rounded-full -translate-x-1/2 ring-4 ring-background"></div>

            <div class="sm:w-[45%] text-left sm:text-right mb-4 sm:mb-0">
              <h3 class="text-xl font-bold text-foreground/80">Intern</h3>
              <p class="text-foreground/50 font-mono text-sm mt-1">April 2024 – August 2024</p>
            </div>

            <div class="sm:w-[45%] bg-surface border border-border rounded-xl p-6 shadow-sm opacity-80">
              <h4 class="font-semibold text-lg mb-2 text-foreground/90">Wisflux Tech Labs</h4>
              <ul class="space-y-2 text-foreground/70 text-sm list-disc list-inside">
                <li>Learned enterprise software development practices.</li>
                <li>Contributed to Angular frontend development.</li>
                <li>Assisted in backend API implementation.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  `
})
export class ExperienceComponent {}

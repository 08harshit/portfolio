import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeadingComponent } from '../ui/section-heading.component';
import { ScrollRevealDirective } from '../utils/scroll-reveal.directive';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule, SectionHeadingComponent, ScrollRevealDirective],
  template: `
    <section class="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <app-section-heading 
        appScrollReveal
        title="Experience" 
        [withDivider]="true">
      </app-section-heading>

      <div class="mt-12 space-y-12">
        
        <div class="relative pl-8 sm:pl-0" appScrollReveal delay="100">
          <div class="hidden sm:block absolute left-[50%] top-0 bottom-0 w-px bg-border -translate-x-1/2"></div>
          
          <!-- Current Role -->
          <div class="relative sm:flex items-center justify-between mb-16">
            <div class="hidden sm:block absolute left-[50%] w-3 h-3 bg-foreground rounded-full -translate-x-1/2 ring-4 ring-background"></div>
            
            <div class="sm:w-[45%] text-left sm:text-right mb-4 sm:mb-0">
              <h3 class="text-xl font-bold">Full Stack Developer</h3>
              <p class="text-foreground/70 font-mono text-sm mt-1">July 2024 – Present</p>
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
          <div class="relative sm:flex items-center justify-between flex-row-reverse">
            <div class="hidden sm:block absolute left-[50%] w-3 h-3 bg-border rounded-full -translate-x-1/2 ring-4 ring-background"></div>
            
            <div class="sm:w-[45%] text-left mb-4 sm:mb-0">
              <h3 class="text-xl font-bold text-foreground/80">Intern</h3>
              <p class="text-foreground/50 font-mono text-sm mt-1">April 2024 – July 2024</p>
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

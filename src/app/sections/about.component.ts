import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeadingComponent } from '../ui/section-heading.component';
import { ScrollRevealDirective } from '../utils/scroll-reveal.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, SectionHeadingComponent, ScrollRevealDirective],
  template: `
    <section class="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div appScrollReveal direction="right">
          <app-section-heading 
            title="Systems Thinking & Engineering Depth" 
            [withDivider]="true">
          </app-section-heading>
        </div>
        
        <div class="space-y-6 text-lg text-foreground/80 leading-relaxed font-sans" appScrollReveal delay="200" direction="left">
          <p>
            As a backend-focused full-stack developer, I specialize in architecting systems that don't just work—they scale elegantly. My approach is rooted in a deep appreciation for system design, performance optimization, and building highly maintainable software.
          </p>
          <p>
            I thrive in the complexity of real-time systems and data-intensive applications. Whether it's architecting a scalable Socket.IO microservice using Redis Pub/Sub, or diving deep into PostgreSQL query execution plans to reduce payload sizes by 95%, I believe that performance is a feature, not an afterthought.
          </p>
          <p>
            I enjoy solving complex technical challenges involving distributed systems, database optimization, scalable architectures, and developer experience. For me, the best code is the code you don't have to write, and the best architectures are the ones that remain simple even as business requirements grow complex.
          </p>
        </div>
      </div>
    </section>
  `
})
export class AboutComponent {}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../utils/scroll-reveal.directive';
import { Github, Linkedin, Mail } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective, LucideAngularModule],
  template: `
    <section class="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/50 text-center">
      <div class="max-w-3xl mx-auto space-y-8" appScrollReveal>
        <h2 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-8">
          Let's build something <br class="hidden sm:block"/> extraordinary.
        </h2>
        
        <p class="text-xl text-foreground/70 leading-relaxed font-serif italic max-w-2xl mx-auto">
          "Currently focused on backend engineering, distributed systems, performance optimization, and building software that scales."
        </p>

        <div class="flex items-center justify-center gap-6 pt-12">
          <a href="https://github.com/08harshit" target="_blank" class="p-4 rounded-full bg-surface border border-border hover:bg-foreground hover:text-background transition-all hover:scale-110">
            <lucide-icon name="github" [size]="24"></lucide-icon>
            <span class="sr-only">GitHub</span>
          </a>
          <a href="https://linkedin.com/in/harshitsen" target="_blank" class="p-4 rounded-full bg-surface border border-border hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all hover:scale-110">
            <lucide-icon name="linkedin" [size]="24"></lucide-icon>
            <span class="sr-only">LinkedIn</span>
          </a>
          <a href="mailto:hello@harshitsen.dev" class="p-4 rounded-full bg-surface border border-border hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all hover:scale-110">
            <lucide-icon name="mail" [size]="24"></lucide-icon>
            <span class="sr-only">Email</span>
          </a>
        </div>
      </div>
      
      <div class="mt-32 pt-8 border-t border-border/30 text-sm text-foreground/40 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© 2026 Harshit Sen. All rights reserved.</p>
        <p class="font-mono text-xs tracking-widest">DESIGNED & ENGINEERED FOR SCALE</p>
      </div>
    </section>
  `
})
export class ContactComponent {
  readonly Github = Github;
  readonly Linkedin = Linkedin;
  readonly Mail = Mail;
}

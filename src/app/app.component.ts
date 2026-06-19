import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { inject } from '@vercel/analytics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-background text-foreground selection:bg-surface-hover selection:text-white">
      
      <!-- Minimal Sticky Navbar -->
      <header class="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a routerLink="/" class="font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
            HS<span class="text-emerald-500">.</span>
          </a>
          <nav class="hidden md:flex gap-8 text-sm font-medium text-foreground/70">
            <a routerLink="/" fragment="about" class="hover:text-foreground transition-colors">About</a>
            <a routerLink="/" fragment="work" class="hover:text-foreground transition-colors">Work</a>
            <a routerLink="/" fragment="experience" class="hover:text-foreground transition-colors">Experience</a>
            <a routerLink="/" fragment="writing" class="hover:text-foreground transition-colors">Writing</a>
          </nav>
          <a routerLink="/" fragment="contact" class="text-sm font-medium hover:text-emerald-400 transition-colors">
            Get in touch &rarr;
          </a>
        </div>
      </header>

      <!-- Router Outlet -->
      <main class="pt-16">
        <router-outlet></router-outlet>
      </main>

    </div>
  `
})
export class AppComponent implements OnInit {
  title = 'portfolio';

  ngOnInit() {
    inject();
  }
}

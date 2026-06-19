import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { inject } from '@vercel/analytics';
import { CursorComponent } from './ui/cursor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, CursorComponent],
  template: `
    <div class="min-h-screen bg-background text-foreground selection:bg-surface-hover selection:text-white cursor-none relative">
      <!-- Matte Noise Overlay -->
      <div class="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-20 mix-blend-overlay" style="background-image: url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E&quot;);"></div>

      <app-cursor></app-cursor>
      
      <!-- Minimal Sticky Navbar -->
      <header class="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a routerLink="/" class="font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
            HS<span class="text-emerald-500">.</span>
          </a>
          <nav class="hidden md:flex gap-8 text-sm font-medium text-foreground/70">
            <a routerLink="/" fragment="about" class="relative group transition-colors">
              About
              <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a routerLink="/" fragment="work" class="relative group transition-colors">
              Work
              <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a routerLink="/" fragment="experience" class="relative group transition-colors">
              Experience
              <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a routerLink="/" fragment="writing" class="relative group transition-colors">
              Writing
              <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>
          <a routerLink="/" fragment="contact" class="group flex items-center text-sm font-medium text-foreground hover:text-emerald-400 transition-colors">
            Get in touch 
            <span class="ml-2 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
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

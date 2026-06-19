import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SectionHeadingComponent } from '../ui/section-heading.component';
import { ScrollRevealDirective } from '../utils/scroll-reveal.directive';
import { ArrowRight } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { ARTICLES } from '../data/articles.data';

@Component({
  selector: 'app-writing',
  standalone: true,
  imports: [CommonModule, RouterLink, SectionHeadingComponent, ScrollRevealDirective, LucideAngularModule],
  template: `
    <section class="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-border/50">
      <app-section-heading 
        appScrollReveal
        title="Writing & Insights" 
        [withDivider]="true">
      </app-section-heading>

      <div class="mt-12 space-y-6">
        <a *ngFor="let article of articles; let i = index" 
           [routerLink]="['/article', article.id]" 
           appScrollReveal 
           [delay]="i * 100"
           class="group block p-6 sm:p-8 bg-background border border-border rounded-xl hover:border-foreground/30 hover:shadow-sm transition-all duration-300 relative overflow-hidden">
           
          <div class="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
            <div class="space-y-2">
              <div class="flex items-center gap-3 text-sm text-foreground/50 font-mono">
                <span>{{ article.date }}</span>
                <span>•</span>
                <span>{{ article.readTime }} read</span>
              </div>
              <h3 class="text-xl font-bold group-hover:text-emerald-400 transition-colors">{{ article.title }}</h3>
            </div>
            
            <div class="p-3 rounded-full bg-surface group-hover:bg-foreground group-hover:text-background transition-colors flex-shrink-0">
              <lucide-icon name="arrow-right" [size]="20"></lucide-icon>
            </div>
          </div>
        </a>
      </div>
    </section>
  `
})
export class WritingComponent {
  readonly ArrowRight = ArrowRight;
  articles = ARTICLES;
}

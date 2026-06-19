import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ARTICLES, Article } from '../data/articles.data';
import { ArrowLeft } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { marked } from 'marked';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      
      <a routerLink="/" class="inline-flex items-center text-sm font-medium text-foreground/50 hover:text-emerald-400 transition-colors mb-12">
        <lucide-icon name="arrow-left" [size]="16" class="mr-2"></lucide-icon>
        Back to Portfolio
      </a>

      <article *ngIf="article" class="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        <div class="space-y-4 mb-12">
          <div class="flex items-center gap-3 text-sm text-emerald-500 font-mono">
            <span>{{ article.date }}</span>
            <span>•</span>
            <span>{{ article.readTime }} read</span>
          </div>
          <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.2]">
            {{ article.title }}
          </h1>
        </div>
        
        <div class="prose prose-invert prose-emerald max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-p:text-foreground/80 prose-p:leading-relaxed prose-li:text-foreground/80" 
             [innerHTML]="parsedContent">
        </div>
      </article>
      
      <div *ngIf="!article" class="text-center py-20">
        <h2 class="text-2xl font-bold mb-4">Article not found</h2>
        <a routerLink="/" class="text-emerald-400 hover:underline">Return home</a>
      </div>
    </div>
  `,
  styles: [`
    .prose h2 {
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 0.5rem;
    }
  `]
})
export class ArticleComponent implements OnInit {
  article: Article | undefined;
  parsedContent: string = '';
  readonly ArrowLeft = ArrowLeft;

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.article = ARTICLES.find(a => a.id === id);
    if (this.article) {
      this.parsedContent = await marked.parse(this.article.content);
    }
    window.scrollTo(0, 0);
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeadingComponent } from '../ui/section-heading.component';
import { BadgeComponent } from '../ui/badge.component';
import { CardComponent } from '../ui/card.component';
import { ButtonComponent } from '../ui/button.component';
import { ScrollRevealDirective } from '../utils/scroll-reveal.directive';

interface FeaturedProject {
  title: string;
  tagline: string;
  stack: string[];
  pitch: string;
  features: string[];
  factBadges: string[];
  highlights: string[];
  infraNotes: string[];
  githubUrl?: string;
  liveUrl?: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    SectionHeadingComponent,
    BadgeComponent,
    CardComponent,
    ButtonComponent,
    ScrollRevealDirective
  ],
  template: `
    <section class="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/50">
      <app-section-heading
        appScrollReveal
        title="Featured Projects"
        subtitle="Complete products designed, built, and deployed end-to-end — not just the code, but the architecture and infrastructure behind it."
        align="center">
      </app-section-heading>

      <div class="space-y-12 mt-16">
        <app-card
          *ngFor="let project of projects"
          appScrollReveal
          delay="100"
          customClass="p-2"
        >
          <div class="p-6 sm:p-8 space-y-8">
            <!-- Header -->
            <div class="space-y-4">
              <div class="flex flex-wrap gap-2">
                <app-badge variant="outline" *ngFor="let tech of project.stack">{{ tech }}</app-badge>
              </div>
              <h3 class="text-3xl font-bold tracking-tight">{{ project.title }}</h3>
              <p class="text-foreground/60 font-mono text-sm">{{ project.tagline }}</p>
              <p class="text-lg text-foreground/75 leading-relaxed max-w-3xl">{{ project.pitch }}</p>
            </div>

            <!-- What it does (plain-language features) -->
            <div>
              <h4 class="text-xs font-mono text-foreground/50 mb-3 tracking-wider">WHAT IT DOES</h4>
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-foreground/80 text-sm list-disc list-inside">
                <li *ngFor="let feature of project.features">{{ feature }}</li>
              </ul>
            </div>

            <!-- Architecture diagram -->
            <div class="bg-surface-hover/50 border border-border rounded-xl p-6 sm:p-8">
              <h4 class="text-xs font-mono text-foreground/50 mb-6 tracking-wider">MONOREPO ARCHITECTURE</h4>
              <div class="flex flex-col items-center gap-4">
                <div class="flex flex-wrap justify-center gap-3 font-mono text-sm">
                  <div class="px-4 py-2 bg-background border border-border rounded text-center shadow-sm">api (NestJS)</div>
                  <div class="px-4 py-2 bg-background border border-border rounded text-center shadow-sm">website (Next.js)</div>
                  <div class="px-4 py-2 bg-background border border-border rounded text-center shadow-sm">admin (Vite SPA)</div>
                  <div class="px-4 py-2 bg-background border border-border rounded text-center shadow-sm">mobile (Expo)</div>
                </div>
                <div class="h-6 border-l border-dashed border-border/50"></div>
                <div class="px-6 py-2 bg-surface-hover border border-border rounded text-center shadow-sm font-mono text-sm">
                  packages/ (shared types, constants, utils)
                </div>
                <div class="h-6 border-l border-dashed border-border/50"></div>
                <div class="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-center shadow-sm font-mono text-sm">
                  EC2 + Docker Compose + Caddy &middot; S3/CloudFront &middot; Lambda
                </div>
              </div>
            </div>

            <!-- Fact badges -->
            <div class="flex flex-wrap gap-3">
              <app-badge variant="secondary" *ngFor="let fact of project.factBadges" customClass="text-sm px-3 py-1">
                {{ fact }}
              </app-badge>
            </div>

            <!-- Expandable breakdown -->
            <div>
              <button
                type="button"
                (click)="project.expanded = !project.expanded"
                class="text-sm font-mono text-foreground/60 hover:text-foreground transition-colors inline-flex items-center gap-2"
              >
                <span>{{ project.expanded ? '▲' : '▼' }}</span>
                {{ project.expanded ? 'Hide full breakdown' : 'View full breakdown' }}
              </button>

              <div *ngIf="project.expanded" class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h4 class="text-xs font-mono text-foreground/50 mb-3 tracking-wider">ENGINEERING HIGHLIGHTS</h4>
                  <ul class="space-y-2 text-foreground/80 text-sm list-disc list-inside">
                    <li *ngFor="let item of project.highlights">{{ item }}</li>
                  </ul>
                </div>
                <div>
                  <h4 class="text-xs font-mono text-foreground/50 mb-3 tracking-wider">INFRASTRUCTURE &amp; TRADE-OFFS</h4>
                  <ul class="space-y-2 text-foreground/80 text-sm list-disc list-inside">
                    <li *ngFor="let item of project.infraNotes">{{ item }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Links -->
            <div class="flex gap-4 pt-2">
              <app-button variant="outline" size="sm" [disabled]="!project.githubUrl" customClass="opacity-60">
                GitHub &rarr;
              </app-button>
              <a *ngIf="project.liveUrl; else liveDisabled" [href]="project.liveUrl" target="_blank" rel="noopener noreferrer">
                <app-button variant="outline" size="sm">Live demo &rarr;</app-button>
              </a>
              <ng-template #liveDisabled>
                <app-button variant="outline" size="sm" [disabled]="true" customClass="opacity-60">
                  Live demo &rarr;
                </app-button>
              </ng-template>
            </div>
          </div>
        </app-card>
      </div>
    </section>
  `
})
export class ProjectsComponent {
  projects: (FeaturedProject & { expanded?: boolean })[] = [
    {
      title: 'Master Acres — Real Estate Marketplace Platform',
      tagline: 'Built & deployed end-to-end: backend, infrastructure, and CI/CD.',
      stack: ['NestJS', 'PostgreSQL', 'Next.js', 'React Native', 'AWS', 'Docker'],
      pitch:
        'A production two-sided property marketplace connecting buyers, vendors, and admins across web, mobile, and an internal back-office. Buyers discover listings, book site visits, and negotiate offers; vendors manage KYC, subscriptions, and paid visibility; admins moderate content with full audit logging.',
      features: [
        'Property & project listings with search and discovery ranking',
        'Short-video "reels" feed for property content',
        'Site-visit booking with OTP-verified check-in',
        'Buyer–vendor offer negotiation with automatic expiry',
        'Paid vendor verification, subscription plans, and an in-app credit system',
        'Vendor KYC and bank-account verification for payouts',
        'In-app and push notifications',
        'Admin back-office with full audit logging of moderation actions',
        'Blog/news content for SEO and buyer education'
      ],
      factBadges: [
        '4 apps, 1 monorepo',
        'Built & deployed end-to-end',
        'Zero standing cloud credentials',
        'OIDC CI/CD — no SSH, no static keys'
      ],
      highlights: [
        'Contract-first monorepo: a shared types package turns a backend DTO change into a compile error on the frontend/mobile side, not a runtime bug after deploy.',
        'JWT auth with OTP (SMS + email) and Google OAuth; revocable refresh tokens so a role change or suspension invalidates sessions immediately.',
        'Razorpay payments behind a pluggable provider interface, with per-surface webhook secrets verified via HMAC over the raw request body.',
        'Direct-to-S3 presigned uploads keep the API stateless; an event-driven Lambda generates WebP image variants and ffmpeg extracts video poster frames.',
        'Idempotent in-process cron jobs handle offer/listing expiry and feed-ranking — safe across replicas without queue infrastructure.',
        'Safety defaults baked into the code: local-storage and manual-payment providers refuse to start in production mode.'
      ],
      infraNotes: [
        'Single EC2 instance running Docker Compose (API, website, Postgres, Caddy), each service in an isolated network — the public proxy has no path to the database.',
        'Caddy handles automatic HTTPS in place of an ALB + ACM setup — a documented ~$20/month saving with a noted upgrade path.',
        'Containerized PostgreSQL rather than RDS at current scale, with a nightly pg_dump backup sidecar uploading to S3 via IAM role (no AWS keys in any container).',
        'Admin SPA deployed to S3 + CloudFront with cache-aware two-pass uploads and targeted invalidation.',
        'GitHub Actions: every PR runs lint/typecheck/tests; deploys authenticate via GitHub OIDC federation and roll out through AWS SSM send-command — no long-lived credentials, no bastion.'
      ],
      githubUrl: undefined,
      liveUrl: 'https://www.masteracres.com',
      expanded: false
    }
  ];
}

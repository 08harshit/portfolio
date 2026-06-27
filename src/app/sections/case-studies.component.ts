import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeadingComponent } from '../ui/section-heading.component';
import { BadgeComponent } from '../ui/badge.component';
import { ScrollRevealDirective } from '../utils/scroll-reveal.directive';

@Component({
  selector: 'app-case-studies',
  standalone: true,
  imports: [CommonModule, SectionHeadingComponent, BadgeComponent, ScrollRevealDirective],
  template: `
    <section class="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/50">
      <app-section-heading 
        appScrollReveal
        title="Featured Engineering Work" 
        subtitle="Deep dives into complex systems, architectural decisions, and measurable outcomes."
        align="center">
      </app-section-heading>

      <div class="space-y-32 mt-16">
        
        <!-- Case Study 1 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" appScrollReveal delay="100">
          <div class="space-y-6">
            <div class="flex gap-2">
              <app-badge variant="outline">WebSockets</app-badge>
              <app-badge variant="outline">Redis</app-badge>
              <app-badge variant="outline">Microservices</app-badge>
            </div>
            <h3 class="text-3xl font-bold tracking-tight">Real-Time Collaboration Platform</h3>
            
            <div class="space-y-4 text-foreground/80">
              <div>
                <h4 class="font-semibold text-foreground">The Problem</h4>
                <p>Users needed to collaborate within projects and instantly see activity from other users without refreshing the page.</p>
              </div>
              <div>
                <h4 class="font-semibold text-foreground">The Solution</h4>
                <p>Designed and built a dedicated Socket.IO microservice using NestJS. Implemented a room-based architecture for project-scoped communication, presence tracking, and user activity streaming. Scaled horizontally using Redis Pub/Sub adapter.</p>
              </div>
              <div>
                <h4 class="font-semibold text-foreground">The Impact</h4>
                <p>Achieved sub-100ms real-time sync, drastically reducing manual refreshes and significantly improving end-user experience across the platform.</p>
              </div>
            </div>
          </div>
          
          <div class="bg-surface border border-border rounded-xl p-8 relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h4 class="text-xs font-mono text-foreground/50 mb-6 tracking-wider">ARCHITECTURE DIAGRAM</h4>
            <div class="flex flex-col items-center space-y-4 font-mono text-sm">
              <div class="w-48 py-3 bg-background border border-border rounded text-center shadow-sm">Angular Client</div>
              <div class="h-6 border-l border-dashed border-border/50"></div>
              <div class="w-48 py-3 bg-surface-hover border border-border rounded text-center shadow-sm relative">
                <span class="absolute -right-2 -top-2 flex h-4 w-4"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-background"></span></span>
                Socket.IO Gateway
              </div>
              <div class="h-6 border-l border-dashed border-border/50"></div>
              <div class="w-48 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-center shadow-sm">Redis Pub/Sub</div>
              <div class="h-6 border-l border-dashed border-border/50"></div>
              <div class="w-48 py-3 bg-background border border-border rounded text-center shadow-sm">Project Rooms</div>
            </div>
          </div>
        </div>

        <!-- Case Study 2 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" appScrollReveal delay="100">
          <div class="order-2 lg:order-1 bg-surface border border-border rounded-xl p-8 relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h4 class="text-xs font-mono text-foreground/50 mb-6 tracking-wider">PERFORMANCE METRICS</h4>
            <div class="flex flex-col space-y-8">
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="font-mono text-red-400">Before: 1.4 MB Payload</span>
                  <span class="font-mono text-foreground/50">800ms</span>
                </div>
                <div class="h-3 w-full bg-surface-hover rounded overflow-hidden">
                  <div class="h-full bg-red-500/50 w-full"></div>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="font-mono text-emerald-400">After: 10 KB Payload</span>
                  <span class="font-mono text-foreground/50">80ms</span>
                </div>
                <div class="h-3 w-full bg-surface-hover rounded overflow-hidden">
                  <div class="h-full bg-emerald-500/80 w-[5%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6 order-1 lg:order-2">
            <div class="flex gap-2">
              <app-badge variant="outline">PostgreSQL</app-badge>
              <app-badge variant="outline">Query Optimization</app-badge>
            </div>
            <h3 class="text-3xl font-bold tracking-tight">Project Metrics Performance Optimization</h3>
            
            <div class="space-y-4 text-foreground/80">
              <div>
                <h4 class="font-semibold text-foreground">The Problem</h4>
                <p>Frontend was performing heavy aggregations on large API responses. Payload sizes were approximately 1.4 MB, causing severe performance degradation across dashboards.</p>
              </div>
              <div>
                <h4 class="font-semibold text-foreground">The Solution</h4>
                <p>Shifted computation from the frontend to the database layer. Created highly optimized PostgreSQL aggregation queries utilizing <code>SUM</code>, <code>CASE</code>, <code>GROUP BY</code>, and <code>ARRAY_AGG</code> for conditional aggregations.</p>
              </div>
              <div>
                <h4 class="font-semibold text-foreground">The Impact</h4>
                <p>Reduced payload size by ~95% (1.4 MB to 10 KB) and achieved 50–90% faster API response times while eliminating browser main-thread blocking.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Case Study 3 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" appScrollReveal delay="100">
          <div class="space-y-6">
            <div class="flex gap-2">
              <app-badge variant="outline">Kafka</app-badge>
              <app-badge variant="outline">BigQuery</app-badge>
              <app-badge variant="outline">Event-Driven</app-badge>
            </div>
            <h3 class="text-3xl font-bold tracking-tight">Real-Time BigQuery Audit Pipeline</h3>
            
            <div class="space-y-4 text-foreground/80">
              <div>
                <h4 class="font-semibold text-foreground">The Problem</h4>
                <p>Enterprise clients required a reliable, queryable audit trail of every financial and specification change across a 30-module microservice platform without degrading API performance.</p>
              </div>
              <div>
                <h4 class="font-semibold text-foreground">The Solution</h4>
                <p>Engineered an event-driven data pipeline. Implemented PostgreSQL triggers (pg_notify) to capture database-level changes, streamed them through Apache Kafka with dead-letter queue resilience, and batch-loaded processed records into Google BigQuery.</p>
              </div>
            </div>
          </div>
          
          <div class="bg-surface border border-border rounded-xl p-8 relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h4 class="text-xs font-mono text-foreground/50 mb-6 tracking-wider">EVENT PIPELINE</h4>
            <div class="flex flex-col items-center space-y-4 font-mono text-sm">
              <div class="w-48 py-3 bg-background border border-border rounded text-center shadow-sm">PostgreSQL (pg_notify)</div>
              <div class="h-6 border-l border-dashed border-border/50 flex items-center justify-center relative"><span class="absolute bg-background px-2 text-[10px] text-foreground/50">Change Event</span></div>
              <div class="w-48 py-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded text-center shadow-sm">Apache Kafka</div>
              <div class="h-6 border-l border-dashed border-border/50"></div>
              <div class="flex w-48 justify-between relative">
                <div class="w-[45%] py-3 bg-surface-hover border border-border rounded text-center shadow-sm text-xs">Processor</div>
                <div class="w-[45%] py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-center shadow-sm text-xs">DLQ</div>
              </div>
              <div class="h-6 border-l border-dashed border-border/50"></div>
              <div class="w-48 py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-center shadow-sm">Google BigQuery</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  `
})
export class CaseStudiesComponent {}

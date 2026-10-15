import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeadingComponent } from '../ui/section-heading.component';
import { BadgeComponent } from '../ui/badge.component';
import { ScrollRevealDirective } from '../utils/scroll-reveal.directive';
import { PipelineSceneComponent } from '../gl/pipeline-scene.component';
import { PresenceSceneComponent } from '../gl/presence-scene.component';
import { CollapseSceneComponent } from '../gl/collapse-scene.component';

@Component({
  selector: 'app-case-studies',
  standalone: true,
  imports: [
    CommonModule,
    SectionHeadingComponent,
    BadgeComponent,
    ScrollRevealDirective,
    PipelineSceneComponent,
    PresenceSceneComponent,
    CollapseSceneComponent
  ],
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

            <p class="text-lg text-foreground/75 leading-relaxed">
              Users needed to see each other's activity inside a project instantly — no refreshing,
              no polling, no stale state between collaborators.
            </p>

            <p class="text-sm font-mono text-foreground/40 tracking-wide">
              Watch a client broadcast: sub-100ms from one user's action to every other client's screen.
            </p>
          </div>
          
          <app-presence-scene class="block bg-surface border border-border rounded-xl overflow-hidden">
            <!-- Fallback for browsers without WebGL2. -->
            <div class="p-8 h-full">
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
          </app-presence-scene>
        </div>

        <!-- Case Study 2 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" appScrollReveal delay="100">
          <app-collapse-scene class="order-2 lg:order-1 block bg-surface border border-border rounded-xl overflow-hidden">
            <!-- Fallback for browsers without WebGL2. -->
            <div class="p-8 h-full">
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
          </app-collapse-scene>

          <div class="space-y-6 order-1 lg:order-2">
            <div class="flex gap-2">
              <app-badge variant="outline">PostgreSQL</app-badge>
              <app-badge variant="outline">Query Optimization</app-badge>
            </div>
            <h3 class="text-3xl font-bold tracking-tight">Project Metrics Performance Optimization</h3>

            <p class="text-lg text-foreground/75 leading-relaxed">
              Dashboards were aggregating 1.4MB API payloads in the browser, blocking the main
              thread on every load.
            </p>

            <p class="text-sm font-mono text-foreground/40 tracking-wide">
              Moved the aggregation into PostgreSQL — 95% smaller payload, 50–90% faster response.
            </p>
          </div>
        </div>

        <!-- Case Study 3 - pinned: the wrapper is tall, the panel inside sticks to
             the viewport, so scrolling scrubs the pipeline while it stays in view. -->
        <div #pinWrap class="relative h-[300vh] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div class="sticky top-16 flex min-h-[calc(100vh-4rem)] items-center">
        <div class="grid w-full grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-6">
            <div class="flex gap-2">
              <app-badge variant="outline">Kafka</app-badge>
              <app-badge variant="outline">BigQuery</app-badge>
              <app-badge variant="outline">Event-Driven</app-badge>
            </div>
            <h3 class="text-3xl font-bold tracking-tight">Real-Time BigQuery Audit Pipeline</h3>

            <p class="text-lg text-foreground/75 leading-relaxed">
              Enterprise clients needed a queryable audit trail of every financial and specification
              change across a 30-module platform — without slowing down a single API call.
            </p>

            <p class="text-sm font-mono text-foreground/40 tracking-wide">
              Scroll to follow one change event from commit to warehouse.
            </p>
          </div>

          <app-pipeline-scene
            [driver]="pinWrap"
            class="block bg-surface border border-border rounded-xl overflow-hidden">
            <!-- Fallback for browsers without WebGL2. -->
            <div class="p-8 h-full">
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
          </app-pipeline-scene>
        </div>
        </div>
        </div>

      </div>
    </section>
  `
})
export class CaseStudiesComponent {}

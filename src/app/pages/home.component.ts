import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeroComponent } from '../sections/hero.component';
import { ImpactComponent } from '../sections/impact.component';
import { AboutComponent } from '../sections/about.component';
import { CaseStudiesComponent } from '../sections/case-studies.component';
import { ExperienceComponent } from '../sections/experience.component';
import { SkillsComponent } from '../sections/skills.component';
import { PhilosophyComponent } from '../sections/philosophy.component';
import { WritingComponent } from '../sections/writing.component';
import { ContactComponent } from '../sections/contact.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    HeroComponent,
    ImpactComponent,
    AboutComponent,
    CaseStudiesComponent,
    ExperienceComponent,
    SkillsComponent,
    PhilosophyComponent,
    WritingComponent,
    ContactComponent
  ],
  template: `
    <main class="overflow-hidden">
      <app-hero id="top"></app-hero>
      
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-background via-surface/30 to-background animate-gradient-x pointer-events-none"></div>
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
        
        <div class="relative z-10">
          <app-impact></app-impact>
          <app-about id="about"></app-about>
          <app-case-studies id="work"></app-case-studies>
          <app-experience id="experience"></app-experience>
          <app-skills></app-skills>
          <app-philosophy></app-philosophy>
          <app-writing id="writing"></app-writing>
          <app-contact id="contact"></app-contact>
        </div>
      </div>
    </main>
  `
})
export class HomeComponent {}

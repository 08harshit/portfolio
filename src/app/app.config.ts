import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { LucideAngularModule, Github, Linkedin, Mail, ArrowRight, ArrowLeft } from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })
    ),
    importProvidersFrom(LucideAngularModule.pick({ Github, Linkedin, Mail, ArrowRight, ArrowLeft }))
  ]
};

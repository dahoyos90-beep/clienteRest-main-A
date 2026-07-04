import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'; // O zoneless
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), // Mejora el rendimiento
    provideRouter(
        routes, 
        withComponentInputBinding(),
        withViewTransitions() // Añade animaciones suaves entre rutas
    ),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(), // Necesario para componentes que usan animaciones
  ],
};
// feat(demo-app): configure application providers — HttpClient and global error handling

import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';

/**
 * Configuración central de la aplicación.
 *
 * provideHttpClient(withFetch()) habilita la API Fetch nativa del navegador
 * en lugar de XMLHttpRequest, mejorando la compatibilidad con SSR y PWA.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withFetch() usa la Fetch API nativa — más eficiente que XHR en Angular 17+
    provideHttpClient(withFetch()),
  ],
};

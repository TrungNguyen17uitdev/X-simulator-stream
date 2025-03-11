import { InjectionToken } from '@angular/core';

export interface AppConfig {
  production: boolean;
  firebaseConfig: Record<string, string>;
  apiUrl: string;
  countriesApiUrl: string;
  captionApiUrl: string;
  randomUserApiUrl: string;
  randomLocationApiUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),provideHttpClient()]
};
export const API_URL = 'https://localhost:7187';
export const APP_LOGIN_NAME = 'admin';
export const EMPLOYEE_ID = 0;
export const ISADMIN = true;


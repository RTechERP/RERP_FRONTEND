import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { DateTime } from 'luxon';

// Gán vào window để Tabulator nhận diện
(window as any).luxon = { DateTime };


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
(window as any).luxon = { DateTime };

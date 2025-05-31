import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideTranslationApi } from './ai/providers/ai-translation-api.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideTranslationApi()
  ]
};

import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideTranslationApi } from './ai/providers/ai-translation-api.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideTranslationApi()
  ]
};

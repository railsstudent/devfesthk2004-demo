import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideLanguageModel } from './ai/providers/ai-prompt-api.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideLanguageModel(),
  ]
};

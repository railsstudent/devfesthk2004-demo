import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideBuiltInApis } from './ai/providers/ai-built-in-api.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideBuiltInApis(),
  ]
};

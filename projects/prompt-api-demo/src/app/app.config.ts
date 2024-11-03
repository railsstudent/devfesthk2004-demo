import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideAIAssistant } from './ai/providers/ai-prompt-api.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideAIAssistant(),
  ]
};

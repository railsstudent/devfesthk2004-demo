import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideSummarizationApi } from './ai/providers/ai-summarization-api.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideSummarizationApi()
  ]
};

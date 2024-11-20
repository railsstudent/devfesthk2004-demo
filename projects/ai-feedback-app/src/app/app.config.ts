import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideLanguageModel } from './ai/providers/ai-prompt-api.provider';
import { provideTranslationApi } from './ai/providers/ai-translation-api.provider';
import { provideSummarizationApi } from './ai/providers/ai-summarization-api.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideLanguageModel(),
    provideTranslationApi(),
    provideSummarizationApi(),
  ]
};

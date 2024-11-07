import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideAILanguageDetectionAPI } from './ai/providers/ai-language-detector.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(), 
    provideAILanguageDetectionAPI()
  ]
};

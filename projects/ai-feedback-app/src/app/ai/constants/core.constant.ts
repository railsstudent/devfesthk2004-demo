import { InjectionToken } from '@angular/core';
import { TranslationApi } from '../types/translation-api.type';

export const AI_PROMPT_API_TOKEN = new InjectionToken<AILanguageModelFactory | undefined>('AI_PROMPT_API_TOKEN');

export const AI_TRANSLATION_API_TOKEN = new InjectionToken<TranslationApi>('AI_TRANSLATION_API_TOKEN');

export const AI_SUMMARIZATION_API_TOKEN = new InjectionToken<AISummarizerFactory | undefined>('AI_SUMMARIZATION_API_TOKEN');

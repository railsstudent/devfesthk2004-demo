import { InjectionToken } from '@angular/core';
import { PromptApi } from '../types/prompt-api.type';
import { TranslationApi } from '../types/translation-api.type';
import { SummarizerApiDefinition } from '../types/summarizer-api-definition.type';

export const AI_PROMPT_API_TOKEN = new InjectionToken<PromptApi>('AI_PROMPT_API_TOKEN');

export const AI_TRANSLATION_API_TOKEN = new InjectionToken<TranslationApi>('AI_TRANSLATION_API_TOKEN');

export const AI_SUMMARIZATION_API_TOKEN = new InjectionToken<SummarizerApiDefinition>('AI_SUMMARIZATION_API_TOKEN');

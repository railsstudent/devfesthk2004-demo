import { InjectionToken } from '@angular/core';
import { SummarizerApiDefinition } from '../types/summarizer-api-definition.type';

export const AI_SUMMARIZATION_API_TOKEN = new InjectionToken<SummarizerApiDefinition>('AI_SUMMARIZATION_API_TOKEN');

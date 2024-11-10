import { InjectionToken } from '@angular/core';

export interface AISummarizationApi { 
    create: Function, 
    capabilities: Function,
}

export type SummarizationApiDefinition = AISummarizationApi | undefined;

export const AI_SUMMARIZATION_API_TOKEN = new InjectionToken<SummarizationApiDefinition>('AI_SUMMARIZATION_API_TOKEN');

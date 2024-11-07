import { InjectionToken } from '@angular/core';

export interface TranslationApiDefinition { 
    canDetect: Function, 
    canTranslate: Function,
    createDetector: Function,
    createTranslator: Function,
} 
export const AI_TRANSLATION_API_TOKEN = new InjectionToken<TranslationApiDefinition | undefined>('AI_TRANSLATION_API_TOKEN');

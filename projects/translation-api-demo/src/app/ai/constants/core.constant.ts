import { InjectionToken } from '@angular/core';
import { LanguagePair } from '../types/language-pair.type';

export type LanguageDetectionResult = {
    confidence: number;
    detectedLanguage: string;
}

export type AILanguageDetectorCapabilities = {
    available: AICapabilityAvailability;
    languageAvailable: (code: string) => AICapabilityAvailability;
}

export type LanguageDetector = {
    detect: (query: string) => Promise<LanguageDetectionResult[]>;
}

export type LanguageTranslator = {
    destroy: () => void;
    translate: (query: string) => Promise<string>;
}

export interface TranslationApiDefinition { 
    canDetect: () => Promise<AICapabilityAvailability>, 
    canTranslate: (input: LanguagePair) => Promise<AICapabilityAvailability>,
    createDetector: () => Promise<LanguageDetector>,
    createTranslator: (input: LanguagePair) => Promise<LanguageTranslator>,
} 
export const AI_TRANSLATION_API_TOKEN = new InjectionToken<TranslationApiDefinition | undefined>('AI_TRANSLATION_API_TOKEN');

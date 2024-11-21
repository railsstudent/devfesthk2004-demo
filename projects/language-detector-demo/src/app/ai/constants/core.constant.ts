import { InjectionToken } from '@angular/core';
import { LanguageDetectionResult } from '../types/language-detection-result.type';

export type LanguageDetectionResult = {
    confidence: number;
    detectedLanguage: string;
}

export type AILanguageDetectorCapabilities = {
    available: AICapabilityAvailability;
    languageAvailable: (code: string) => AICapabilityAvailability;
}

export type AILanguageDetector = {
    destroy: () => void;
    detect: (query: string) => Promise<LanguageDetectionResult[]>;
}

type LANGUAGE_DETECTOR_API_TYPE = { 
    create: (...args: unknown[]) => Promise<AILanguageDetector>, 
    capabilities: (...args: unknown[]) => Promise<AILanguageDetectorCapabilities> 
};
export const AI_LANGUAGE_DETECTION_API_TOKEN = new InjectionToken<LANGUAGE_DETECTOR_API_TYPE | undefined>('AI_LANGUAGE_DETECTION_API_TOKEN');

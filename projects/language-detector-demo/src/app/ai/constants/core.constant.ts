import { InjectionToken } from '@angular/core';

export type AILanguageDetectorCapabilities = {
    available: AICapabilityAvailability;
    languageAvailable: (code: string) => AICapabilityAvailability;
}

type LANGUAGE_DETECTOR_API_TYPE = { 
    create: Function, 
    capabilities: (...args: unknown[]) => Promise<AILanguageDetectorCapabilities> 
};
export const AI_LANGUAGE_DETECTION_API_TOKEN = new InjectionToken<LANGUAGE_DETECTOR_API_TYPE | undefined>('AI_LANGUAGE_DETECTION_API_TOKEN');

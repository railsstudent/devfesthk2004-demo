import { InjectionToken } from '@angular/core';

export const AI_TRANSLATION_API_TOKEN = new InjectionToken<AITranslatorFactory | undefined>('AI_TRANSLATION_API_TOKEN');

export const AI_LANGUAGE_DETECTION_API_TOKEN = new InjectionToken<AILanguageDetectorFactory | undefined>('AI_LANGUAGE_DETECTION_API_TOKEN');

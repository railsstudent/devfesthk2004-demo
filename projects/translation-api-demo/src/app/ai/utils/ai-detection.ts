import { inject } from '@angular/core';
import { catchError, from, Observable, of } from 'rxjs';
import { AI_LANGUAGE_DETECTION_API_TOKEN, AI_TRANSLATION_API_TOKEN } from '../constants/core.constant';
import { getChromVersion, isChromeBrowser } from './user-agent-data';

const CHROME_VERSION = 131

enum ERROR_CODES {
   NO_TRANSLATOR = 'Build-in Language Translator not found in window. Please check the Translation API\'s explainer in github.com/WICG/translation-api?tab=readme-ov-file#translation',
   TRANSLATION_AFTER_DOWNLLOAD = 'Built-in AI is not ready, please go to chrome://components and start downloading the Chrome TranslateKit.',
   NO_TRANSLATION_API = 'The Translation API is not enabled. Please check your configuration in chrome://flags/#translation-api',
   NO_LANGUAGE_DETECTOR_API = 'The Language Detector API is not enabled. Please check your configuration in chrome://flags/#language-detection-api',
   NO_LANGUAGE_DETECTOR = 'Build-in Language Detector not found. Please check the Translation API\'s explainer in github.com/WICG/translation-api?tab=readme-ov-file#translation',
   NO_CHROME = 'Your browser is not supported. Please use Google Chrome Dev or Canary',
   OLD_CHROME = 'Please upgrade the Chrome version to at least 131'
}

export async function checkChromeBuiltInAI(): Promise<string> {
   if (!isChromeBrowser()) {
      throw new Error(ERROR_CODES.NO_CHROME);
   }

   if (getChromVersion() < CHROME_VERSION) {
      throw new Error(ERROR_CODES.OLD_CHROME);
   }

   if (!('ai' in globalThis)) {
      throw new Error(ERROR_CODES.NO_TRANSLATION_API);
   }

   const languageDetection = inject(AI_LANGUAGE_DETECTION_API_TOKEN);
   const translation = inject(AI_TRANSLATION_API_TOKEN);
   await validateLanguageDetector(languageDetection);
   await validateLanguageTranslator(translation);

   return '';
}

async function validateLanguageTranslator(translation: AITranslatorFactory | undefined) {
   if (translation && 'capabilities' in translation) {
      const canTranslateStatus = (await translation.capabilities()).available;
      if (!canTranslateStatus) {
         throw new Error(ERROR_CODES.NO_TRANSLATOR);
      } else if (canTranslateStatus == 'after-download') {
         throw new Error(ERROR_CODES.TRANSLATION_AFTER_DOWNLLOAD);
      } else if (canTranslateStatus === 'no') {
         throw new Error(ERROR_CODES.NO_TRANSLATION_API);
      }
   }
}

async function validateLanguageDetector(languageDetector: AILanguageDetectorFactory | undefined) {
   const canDetectStatus = (await languageDetector?.capabilities())?.available;
   if (!canDetectStatus) {
      throw new Error(ERROR_CODES.NO_LANGUAGE_DETECTOR);
   } else if (canDetectStatus === 'after-download') {
      throw new Error(ERROR_CODES.TRANSLATION_AFTER_DOWNLLOAD);
   } else if (canDetectStatus === 'no') {
      throw new Error(ERROR_CODES.NO_TRANSLATION_API);
   }
}

export function isTranslationApiSupported(): Observable<string> {
   return from(checkChromeBuiltInAI()).pipe(
      catchError(
         (e) => {
            console.error(e);
            return of(e instanceof Error ? e.message : 'unknown');
         }
      )
   );
}

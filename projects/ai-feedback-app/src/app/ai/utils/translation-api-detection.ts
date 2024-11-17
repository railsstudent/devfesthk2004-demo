import { inject } from '@angular/core';
import { catchError, from, Observable, of } from 'rxjs';
import { AI_TRANSLATION_API_TOKEN } from '../constants/core.constant';
import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';
import { TranslationApi } from '../types/translation-api.type';
import { getChromVersion, isChromeBrowser } from './user-agent-data';

const CHROME_VERSION = 131

enum TRANSLATION_API_ERROR_CODES {
    NOT_CHROME_BROWSER = 'Your browser is not supported. Please use Google Chrome Dev or Canary.',
    OLD_BROWSER = `Please upgrade the Chrome version to at least ${CHROME_VERSION} to support Translation API.`,
    NO_TRANSLATOR = 'Build-in Language Translator not found in window. Please check the Translation API\'s explainer in github.com/WICG/translation-api?tab=readme-ov-file#translation',
    TRANSLATION_AFTER_DOWNLLOAD = 'Built-in AI is not ready, please go to chrome://components and start downloading the Chrome TranslateKit.',
    NO_TRANSLATION_API = 'The model of the Translation API is not implemented. Please check your configuration in chrome://flags/#translation-api',
    NO_LANGUAGE_DETECTOR = 'Build-in Language Detector not found in window. Please check the Translation API\'s explainer in github.com/WICG/translation-api?tab=readme-ov-file#translation',
}

async function checkChromeTranslationApi(): Promise<string> {
   if (!isChromeBrowser()) {
      throw new Error('Your browser is not supported. Please use Google Chrome Dev or Canary.');
   }

   if (getChromVersion() < CHROME_VERSION) {
      throw new Error(TRANSLATION_API_ERROR_CODES.OLD_BROWSER);
   }

   if (!('translation' in globalThis)) {
      throw new Error('Translation API is not available, check your configuration in chrome://flags/#translation-api');
   }

   const translation = inject(AI_TRANSLATION_API_TOKEN);
   await validateLanguageDetector(translation);
   await validateLanguageTranslator(translation);

   return '';
}

async function validateLanguageTranslator(translation: TranslationApi) {
   const canTranslateStatus = await translation?.canTranslate({ sourceLanguage: 'en', targetLanguage: 'es' });
   if (!canTranslateStatus) {
      throw new Error(TRANSLATION_API_ERROR_CODES.NO_TRANSLATOR);
   } else if (canTranslateStatus == CAPABILITIES_AVAILABLE.AFTER_DOWNLOAD) {
      throw new Error(TRANSLATION_API_ERROR_CODES.TRANSLATION_AFTER_DOWNLLOAD);
   } else if (canTranslateStatus === CAPABILITIES_AVAILABLE.NO) {
      throw new Error(TRANSLATION_API_ERROR_CODES.NO_TRANSLATION_API);
   }
}

async function validateLanguageDetector(translation: TranslationApi) {
   const canDetectStatus = await translation?.canDetect();
   if (!canDetectStatus) {
      throw new Error(TRANSLATION_API_ERROR_CODES.NO_LANGUAGE_DETECTOR);
   } else if (canDetectStatus == CAPABILITIES_AVAILABLE.AFTER_DOWNLOAD) {
      throw new Error(TRANSLATION_API_ERROR_CODES.TRANSLATION_AFTER_DOWNLLOAD);
   } else if (canDetectStatus === CAPABILITIES_AVAILABLE.NO) {
      throw new Error(TRANSLATION_API_ERROR_CODES.NO_TRANSLATION_API);
   }
}

export function isTranslationApiSupported(): Observable<string> {
   return from(checkChromeTranslationApi()).pipe(
      catchError(
         (e) => {
            console.error(e);
            return of(e instanceof Error ? e.message : 'unknown');
         }
      )
   );
}

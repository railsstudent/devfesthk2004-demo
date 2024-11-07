import { inject } from '@angular/core';
import { catchError, from, Observable, of } from 'rxjs';
import { AI_TRANSLATION_API_TOKEN, TranslationApiDefinition } from '../constants/core.constant';
import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';
import { getChromVersion, isChromeBrowser } from './user-agent-data';

const CHROME_VERSION = 131

export async function checkChromeBuiltInAI(): Promise<string> {
   if (!isChromeBrowser()) {
      throw new Error('Your browser is not supported. Please use Google Chrome Dev or Canary.');
   }

   if (getChromVersion() < CHROME_VERSION) {
      throw new Error(`Please upgrade the Chrome version to at least ${CHROME_VERSION}.`);
   }

   if (!('translation' in globalThis)) {
      throw new Error('Translation API is not available, check your configuration in chrome://flags/#translation-api');
   }

   const translation = inject(AI_TRANSLATION_API_TOKEN);
   await validateLanguageDetector(translation);
   await validateLanguageTranslator(translation);

   return '';
}

async function validateLanguageTranslator(translation: TranslationApiDefinition | undefined) {
   const canTranslateStatus = await translation?.canTranslate({ sourceLanguage: 'en', targetLanguage: 'es' });
   if (!canTranslateStatus) {
      throw new Error('Build-in Language Translator not found in window. Please check the Translation API\'s explainer in github.com/WICG/translation-api?tab=readme-ov-file#translation');
   } else if (canTranslateStatus == CAPABILITIES_AVAILABLE.AFTER_DOWNLOAD) {
      throw new Error('Built-in AI is not ready, please go to chrome://components and start downloading the Chrome TranslateKit.');
   } else if (canTranslateStatus === CAPABILITIES_AVAILABLE.NO) {
      throw new Error('The model of the Translation API is not implemented. Please check your configuration in chrome://flags/#translation-api');
   }
}

async function validateLanguageDetector(translation: TranslationApiDefinition | undefined) {
   const canDetectStatus = await translation?.canDetect();
   if (!canDetectStatus) {
      throw new Error('Build-in Language Detector not found in window. Please check the Translation API\'s explainer in github.com/WICG/translation-api?tab=readme-ov-file#translation');
   } else if (canDetectStatus == CAPABILITIES_AVAILABLE.AFTER_DOWNLOAD) {
      throw new Error('Built-in AI is not ready, please go to chrome://components and start downloading the Chrome TranslateKit.');
   } else if (canDetectStatus === CAPABILITIES_AVAILABLE.NO) {
      throw new Error('The model of the Translation API is not implemented. Please check your configuration in chrome://flags/#translation-api');
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

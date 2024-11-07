import { inject } from '@angular/core';
import { catchError, from, Observable, of } from 'rxjs';
import { AI_LANGUAGE_DETECTION_API_TOKEN } from '../constants/core.constant';
import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';
import { getChromVersion, isChromeBrowser } from './user-agent-data';

const CHROME_VERSION = 129

export async function checkChromeBuiltInAI(): Promise<string> {
   if (!isChromeBrowser()) {
      throw new Error('Your browser is not supported. Please use Google Chrome Dev or Canary.');
   }

   if (getChromVersion() < CHROME_VERSION) {
      throw new Error(`Please upgrade the Chrome version to at least ${CHROME_VERSION}.`);
   }

   const apiName = 'Language Detection API';
   if (!('ai' in globalThis)) {
      throw new Error(`${apiName} is not available, check your configuration in chrome://flags/#language-detection-api`);
   }

   const languageDetector = inject(AI_LANGUAGE_DETECTION_API_TOKEN);
   const status = (await languageDetector?.capabilities())?.available;
   if (!status) { 
      throw new Error(`${apiName} not found in window. Please check the Prompt API\'s explainer in github.com/WICG/translation-api?tab=readme-ov-file#language-detection`);
   } else if (status === CAPABILITIES_AVAILABLE.AFTER_DOWNLOAD) {
      throw new Error('Built-in AI is not ready, please go to chrome://components and start downloading the Optimization Guide On Device Model');
   } else if (status === CAPABILITIES_AVAILABLE.NO) {
      throw new Error(`The model of ${apiName} is not implemented. Please check your configuration in chrome://flags/#optimization-guide-on-device-model`);
   }

   return '';
}

export function isLanguageDetectionAPISupported(): Observable<string> {
   return from(checkChromeBuiltInAI()).pipe(
      catchError(
         (e) => {
            console.error(e);
            return of(e instanceof Error ? e.message : 'unknown');
         }
      )
   );
}

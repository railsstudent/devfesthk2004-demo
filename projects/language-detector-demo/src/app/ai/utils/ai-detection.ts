import { inject } from '@angular/core';
import { catchError, from, Observable, of } from 'rxjs';
import { AI_LANGUAGE_DETECTION_API_TOKEN } from '../constants/core.constant';
import { getChromVersion, isChromeBrowser } from './user-agent-data';
import { ERROR_CODES } from '../enums/errors.enum';

const CHROME_VERSION = 129

export async function checkChromeBuiltInAI(): Promise<string> {
   if (!isChromeBrowser()) {
      throw new Error(ERROR_CODES.UNSUPPORTED_BROWSER);
   }

   if (getChromVersion() < CHROME_VERSION) {
      throw new Error(ERROR_CODES.OLD_BROSWER);
   }

   const apiName = 'Language Detection API';
   if (!('ai' in globalThis)) {
      throw new Error(ERROR_CODES.NO_API);
   }

   const languageDetector = inject(AI_LANGUAGE_DETECTION_API_TOKEN);
   const status = (await languageDetector?.capabilities())?.available;
   if (!status) { 
      throw new Error(ERROR_CODES.NO_API);
   } else if (status === 'after-download') {
      throw new Error(ERROR_CODES.AFTER_DOWNLOAD);
   } else if (status === 'no') {
      throw new Error(ERROR_CODES.NO_GEMINI_NANO);
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

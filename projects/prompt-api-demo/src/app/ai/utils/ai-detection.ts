import { inject } from '@angular/core';
import { catchError, from, Observable, of } from 'rxjs';
import { AI_PROMPT_API_TOKEN, CHROME_VERSION } from '../constants/core.constant';
import { getChromVersion, isChromeBrowser } from './user-agent-data';
import { ERROR_CODES } from '../enums/error-codes.enum';

export async function checkChromeBuiltInAI(): Promise<string> {
   // if (!isChromeBrowser()) {
   //    throw new Error(ERROR_CODES.NOT_CHROME_BROWSER);
   // }

   // if (getChromVersion() < CHROME_VERSION) {
   //    throw new Error(ERROR_CODES.OLD_BROWSER);
   // }

   if (!('LanguageModel' in globalThis)) {
      throw new Error(ERROR_CODES.NO_PROMPT_API);
   }

   const assistant = inject(AI_PROMPT_API_TOKEN);
   const status = (await assistant?.capabilities())?.available;
   if (!status) { 
      throw new Error(ERROR_CODES.API_NOT_READY);
   } else if (status === 'after-download') {
      throw new Error(ERROR_CODES.AFTER_DOWNLOAD);
   } else if (status === 'no') {
      throw new Error(ERROR_CODES.NO_LARGE_LANGUAGE_MODEL);
   }

   return '';
}

export function isPromptAPISupported(): Observable<string> {
   return from(checkChromeBuiltInAI()).pipe(
      catchError(
         (e) => {
            console.error(e);
            return of(e instanceof Error ? e.message : 'unknown');
         }
      )
   );
}

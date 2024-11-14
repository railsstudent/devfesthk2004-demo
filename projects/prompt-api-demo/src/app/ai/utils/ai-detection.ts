import { inject } from '@angular/core';
import { catchError, from, Observable, of } from 'rxjs';
import { AI_PROMPT_API_TOKEN } from '../constants/core.constant';
import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';
import { getChromVersion, isChromeBrowser } from './user-agent-data';

const CHROME_VERSION = 128

enum ERROR_CODES {
   NOT_CHROME_BROWSER = 'Your browser is not supported. Please use Google Chrome Dev or Canary.',
   OLD_BROWSER = `Please upgrade the Chrome version to at least ${CHROME_VERSION}.`,
   NO_PROMPT_API = 'Prompt API is not available, check your configuration in chrome://flags/#prompt-api-for-gemini-nano',
   API_NOT_READY = 'Build-in Prompt API not found in window. Please check the Prompt API\'s explainer in github.com/explainers-by-googlers/prompt-api',
   AFTER_DOWNLOAD = 'Built-in AI is not ready, please go to chrome://components and start downloading the Optimization Guide On Device Model',
   NO_LARGE_LANGUAGE_MODEL = 'The model of the Prompt API is not implemented. Please check your configuration in chrome://flags/#optimization-guide-on-device-model'
}

export async function checkChromeBuiltInAI(): Promise<string> {
   if (!isChromeBrowser()) {
      throw new Error(ERROR_CODES.NOT_CHROME_BROWSER);
   }

   if (getChromVersion() < CHROME_VERSION) {
      throw new Error(ERROR_CODES.OLD_BROWSER);
   }

   if (!('ai' in globalThis)) {
      throw new Error(ERROR_CODES.NO_PROMPT_API);
   }

   const assistant = inject(AI_PROMPT_API_TOKEN);
   const status = (await assistant?.capabilities())?.available;
   if (!status) { 
      throw new Error(ERROR_CODES.API_NOT_READY);
   } else if (status === CAPABILITIES_AVAILABLE.AFTER_DOWNLOAD) {
      throw new Error(ERROR_CODES.AFTER_DOWNLOAD);
   } else if (status === CAPABILITIES_AVAILABLE.NO) {
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

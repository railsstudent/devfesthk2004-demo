import { inject } from '@angular/core';
import { catchError, from, Observable, of } from 'rxjs';
import { AI_SUMMARIZATION_API_TOKEN } from '../constants/core.constant';
import { getChromVersion, isChromeBrowser } from './user-agent-data';

const CHROME_VERSION = 129

async function checkChromeSummarizationApi(): Promise<string> {
   if (!isChromeBrowser()) {
      throw new Error('Your browser is not supported. Please use Google Chrome Dev or Canary.');
   }

   if (getChromVersion() < CHROME_VERSION) {
      throw new Error(`Please upgrade the Chrome version to at least ${CHROME_VERSION}.`);
   }

   if (!('ai' in globalThis)) {
      throw new Error('Summarization API is not available, check your configuration in chrome://flags/#summarization-api-for-gemini-nano');
   }

   const summarizer = inject(AI_SUMMARIZATION_API_TOKEN);
   const status = (await summarizer?.capabilities())?.available;
   if (!status) { 
      throw new Error('Build-in Summarizer API not found in window. Please check the Summarizer API\'s explainer in https://github.com/WICG/writing-assistance-apis');
   } else if (status === 'after-download') {
      throw new Error('Built-in AI is not ready, please go to chrome://components and start downloading the Optimization Guide On Device Model');
   } else if (status === 'no') {
      throw new Error('The model of the Summarization API is not implemented. Please check your configuration in chrome://flags/#optimization-guide-on-device-model');
   }

   return '';
}

export function isSummarizationAPISupported(): Observable<string> {
   return from(checkChromeSummarizationApi()).pipe(
      catchError(
         (e) => {
            console.error(e);
            return of(e instanceof Error ? e.message : 'unknown');
         }
      )
   );
}

import { inject } from '@angular/core';
import { catchError, from, Observable, of } from 'rxjs';
import { AI_WRITER_API_TOKEN } from '../constants/core.constant';
import { getChromVersion, isChromeBrowser } from './user-agent-data';

const CHROME_VERSION = 133

enum WRITER_API_ERROR_CODES {
   NOT_CHROME_BROWSER = 'Your browser is not supported. Please use Google Chrome Dev or Canary.',
   OLD_BROWSER = `Please upgrade the Chrome version to at least ${CHROME_VERSION} to support Writer API.`,
   NO_WRITER_API = 'Writer API is not available, check your configuration in cchrome://flags/#writer-api-for-gemini-nano',
   API_NOT_READY = 'Build-in Writer API not found in window. Please check the Prompt API\'s explainer in github.com/WICG/writing-assistance-apis',
   AFTER_DOWNLOAD = 'Built-in AI is not ready, please go to chrome://components and start downloading the Optimization Guide On Device Model',
   NO_LARGE_LANGUAGE_MODEL = 'The model of the Prompt API is not implemented. Please check your configuration in chrome://flags/#optimization-guide-on-device-model'
}

async function checkChromeWriterApi(): Promise<string> {
    if (!isChromeBrowser()) {
        throw new Error(WRITER_API_ERROR_CODES.NOT_CHROME_BROWSER);
    }

    if (getChromVersion() < CHROME_VERSION) {
        throw new Error(WRITER_API_ERROR_CODES.OLD_BROWSER);
    }

    if (!('ai' in globalThis)) {
        throw new Error(WRITER_API_ERROR_CODES.NO_WRITER_API);
    }

    const writer = inject(AI_WRITER_API_TOKEN);
    if (writer && 'capabilities' in writer) {
        const status = (await writer.capabilities()).available;
        if (!status) { 
            throw new Error(WRITER_API_ERROR_CODES.API_NOT_READY);
        } else if (status === 'after-download') {
            throw new Error(WRITER_API_ERROR_CODES.AFTER_DOWNLOAD);
        } else if (status === 'no') {
            throw new Error(WRITER_API_ERROR_CODES.NO_LARGE_LANGUAGE_MODEL);
        }
    }

   return '';
}

export function isWriterAPISupported(): Observable<string> {
   return from(checkChromeWriterApi()).pipe(
      catchError(
         (e) => {
            console.error(e);
            return of(e instanceof Error ? e.message : 'unknown');
         }
      )
   );
}

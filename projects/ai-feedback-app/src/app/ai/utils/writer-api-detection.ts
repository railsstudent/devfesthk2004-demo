import { catchError, from, Observable, of } from 'rxjs';
import { WRITER_AVAILABILITY_OPTIONS } from '../constants/writer.constant';

const CHROME_VERSION = 133

enum WRITER_API_ERROR_CODES {
   NO_WRITER_API = 'Writer API is not available, check your configuration in cchrome://flags/#writer-api-for-gemini-nano',
   API_NOT_READY = 'Build-in Writer API not found in window. Please check the Prompt API\'s explainer in github.com/WICG/writing-assistance-apis',
   NO_LARGE_LANGUAGE_MODEL = 'The model of the Prompt API is not implemented. Please check your configuration in chrome://flags/#optimization-guide-on-device-model'
}

async function checkChromeWriterApi(): Promise<string> {
    if (!('Writer' in self)) {
        throw new Error(WRITER_API_ERROR_CODES.NO_WRITER_API);
    }

    const availability = await Writer.availability(WRITER_AVAILABILITY_OPTIONS);
    if (availability === 'unavailable') {
        throw new Error(WRITER_API_ERROR_CODES.NO_LARGE_LANGUAGE_MODEL);
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

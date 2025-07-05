import { catchError, from, Observable, of } from 'rxjs';
import { SUMMARIZER_AVAILABILITY_OPTIONS } from '../constants/summarizer.constant';

async function checkChromeSummarizationApi(): Promise<string> {
   if (!('Summarizer' in self)) {
      throw new Error('Summarization API is not available, check your configuration in chrome://flags/#summarization-api-for-gemini-nano');
   }

   const status = await Summarizer.availability(SUMMARIZER_AVAILABILITY_OPTIONS);
   if (status === 'unavailable') {
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

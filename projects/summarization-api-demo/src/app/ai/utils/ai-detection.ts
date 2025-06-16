import { catchError, from, map, Observable, of } from 'rxjs';
import { ERROR_CODES } from '../enums/error-codes.enum';

async function getSummarizationAPIAvailability(): Promise<string> {
   if (!('Summarizer' in self)) {
      throw new Error(ERROR_CODES.NO_SUMMARIZATION_API);
   }

   const availability = await Summarizer.availability();
   if (availability === 'unavailable') { 
      throw new Error(ERROR_CODES.NO_SUMMARIZATION_API);
   }

   return availability;
}

export function isSummarizationAPISupported(): Observable<string> {
   return from(getSummarizationAPIAvailability()).pipe(
      map(() => ''),
      catchError(
         (e) => {
            console.error(e);
            return of(e instanceof Error ? e.message : 'unknown');
         }
      )
   );
}

import { catchError, from, map, Observable, of } from 'rxjs';
import { ERROR_CODES } from '../enums/error-codes.enum';


export async function getAvailability(options: SummarizerCreateCoreOptions): Promise<Omit<Availability, 'unavailable'>> {
   const availability = await Summarizer.availability(options);
   if (availability === 'unavailable') { 
      throw new Error(ERROR_CODES.NO_SUMMARIZATION_API);
   }

   return availability;
}

async function isAPIEnabled(): Promise<boolean> {
   if (!('Summarizer' in self)) {
      throw new Error(ERROR_CODES.NO_SUMMARIZATION_API);
   }

   return true;
}

export function isSummarizationAPISupported(): Observable<string> {
   return from(isAPIEnabled()).pipe(
      map(() => ''),
      catchError(
         (e) => {
            console.error(e);
            return of(e instanceof Error ? e.message : 'unknown');
         }
      )
   );
}

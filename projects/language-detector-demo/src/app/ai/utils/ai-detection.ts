import { catchError, from, map, Observable, of } from 'rxjs';
import { ERROR_CODES } from '../enums/errors.enum';

export async function getLanguageDetectorAPIAvailability(): Promise<string> {
   if (!('LanguageDetector' in self)) {
      throw new Error(ERROR_CODES.NO_API);
   }

   const availability = await LanguageDetector.availability();
   if (availability === 'unavailable') { 
      throw new Error(ERROR_CODES.NO_LLM);
   }

   return availability;
}

export function isLanguageDetectionAPISupported(): Observable<string> {
   return from(getLanguageDetectorAPIAvailability()).pipe(
      map(() => ''),
      catchError(
         (e) => {
            console.error(e);
            return of(e instanceof Error ? e.message : 'unknown');
         }
      )
   );
}

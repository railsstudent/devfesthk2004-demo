import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { ERROR_CODES } from '../enums/error-codes.enum';

export async function getLanguageDetectorAPIAvailability(): Promise<Omit<Availability, 'uavailable'>> {
   if (!('Translator' in self)) {
      throw new Error(ERROR_CODES.NO_TRANSLATION_API);
   }

   return validateLanguageDetector();
}

export async function isTranslatorAPISupported(): Promise<boolean> {
   if (!('Translator' in self)) {
      throw new Error(ERROR_CODES.NO_TRANSLATION_API);
   }
   return true;
}

export async function validateLanguageDetector() {
   if (!('LanguageDetector' in self)) {
      throw new Error(ERROR_CODES.NO_LANGUAGE_DETECTOR_API);
   }

   const availability = await LanguageDetector.availability()

   if (availability === 'unavailable') {
      throw new Error(ERROR_CODES.NO_LANGUAGE_DETECTOR);
   }

   return availability;
}

export function areAPIsSupported(): Observable<string> {
   return from(getLanguageDetectorAPIAvailability()).pipe(
      switchMap (() => {
         return isTranslatorAPISupported()
            .then(() => '')
            .catch((e) => {
               console.error(e);
               return e instanceof Error ? e.message : 'Unknown error encountered in the Translator API';
            })
      }),
      map((errTranslatorAPI) => errTranslatorAPI ? errTranslatorAPI : ''),
      catchError(
         (e) => {
            console.error(e);
            return of(e instanceof Error ? e.message : 'unknown');
         }
      )
   );
}

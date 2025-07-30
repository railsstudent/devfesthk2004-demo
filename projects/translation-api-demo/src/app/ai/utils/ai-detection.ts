import { catchError, from, map, Observable, of } from 'rxjs';
import { EXPECTED_INPUT_LANGUAGES } from '../constants/input-languages.constant';
import { ERROR_CODES } from '../enums/error-codes.enum';

export async function validateLanguageDetector() {
   if (!('LanguageDetector' in self)) {
      throw new Error(ERROR_CODES.NO_LANGUAGE_DETECTOR_API);
   }

   const availability = await LanguageDetector.availability({
      expectedInputLanguages: EXPECTED_INPUT_LANGUAGES,
   })

   if (availability === 'unavailable') {
      throw new Error(ERROR_CODES.NO_LANGUAGE_DETECTOR);
   }

   return availability;
}

export async function areAPIsEnabled(): Promise<boolean> {
   await validateLanguageDetector();

   if (!('Translator' in self)) {
      throw new Error(ERROR_CODES.NO_TRANSLATION_API);
   }

   return true;
}

export function areAPIsSupported(): Observable<string> {
   return from(areAPIsEnabled()).pipe(
      map((result) => result ? '' : 'error in map'),
      catchError(
         (e) => {
            console.error(e);
            return of(e instanceof Error ? e.message : 'unknown');
         }
      )
   );
}

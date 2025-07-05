import { catchError, from, Observable, of } from 'rxjs';
import { ERROR_CODES } from '../enums/error-codes.enum';

export async function isLanguageModelEnabled(): Promise<string> {
   if (!('LanguageModel' in globalThis)) {
      throw new Error(ERROR_CODES.NO_PROMPT_API);
   }

   const availability = await LanguageModel.availability();
   if (availability == 'unavailable') {
      throw new Error(ERROR_CODES.NO_LARGE_LANGUAGE_MODEL);
   }

   return '';
}

export function isPromptAPISupported(): Observable<string> {
   return from(isLanguageModelEnabled()).pipe(
      catchError(
         (e) => {
            console.error(e);
            return of(e instanceof Error ? e.message : 'unknown');
         }
      )
   );
}

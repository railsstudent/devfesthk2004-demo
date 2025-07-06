import { catchError, from, Observable, of } from 'rxjs';

async function checkChromeTranslationApi(): Promise<string> {
   if (!('Translator' in self)) {
      throw new Error('Translation API is not available, check your configuration in chrome://flags/#translation-api');
   }

   return '';
}

export function isTranslationApiSupported(): Observable<string> {
   return from(checkChromeTranslationApi()).pipe(
      catchError(
         (e) => {
            console.error(e);
            return of(e instanceof Error ? e.message : 'unknown');
         }
      )
   );
}

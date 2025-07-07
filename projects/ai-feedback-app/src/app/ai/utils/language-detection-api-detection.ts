import { catchError, from, Observable, of } from 'rxjs';

async function checkLanguageDetectionApi(): Promise<string> {
   if (!('LanguageDetector' in self)) {
      throw new Error('Language Detection API is not available, check your configuration in chrome://flags/#language-detection-api');
   }

   return '';
}

export function isLanguageDetectionApiSupported(): Observable<string> {
   return from(checkLanguageDetectionApi()).pipe(
      catchError(
         (e) => {
            console.error(e);
            return of(e instanceof Error ? e.message : 'unknown');
         }
      )
   );
}

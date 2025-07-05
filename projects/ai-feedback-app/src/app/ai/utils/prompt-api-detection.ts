import { catchError, from, Observable, of } from 'rxjs';
import { PROMPT_OPTIONS } from '../constants/prompt.constant';

enum PROMPT_API_ERROR_CODES {
   NO_PROMPT_API = 'Prompt API is not available, check your configuration in chrome://flags/#prompt-api-for-gemini-nano',
   NO_LARGE_LANGUAGE_MODEL = 'The model of the Prompt API is not implemented. Please check your configuration in chrome://flags/#optimization-guide-on-device-model'
}

async function checkChromePromptApi(): Promise<string> {
   if (!('LanguageModel' in self)) {
      throw new Error(PROMPT_API_ERROR_CODES.NO_PROMPT_API);
   }

   const status = await LanguageModel.availability(PROMPT_OPTIONS);
   if (status === 'unavailable') {
      throw new Error(PROMPT_API_ERROR_CODES.NO_LARGE_LANGUAGE_MODEL);
   }

   return '';
}

export function isPromptApiSupported(): Observable<string> {
   return from(checkChromePromptApi()).pipe(
      catchError(
         (e) => {
            console.error(e);
            return of(e instanceof Error ? e.message : 'unknown');
         }
      )
   );
}

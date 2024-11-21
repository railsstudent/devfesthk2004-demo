import { isPlatformBrowser } from '@angular/common';
import { EnvironmentProviders, inject, makeEnvironmentProviders, PLATFORM_ID } from '@angular/core';
import { AI_PROMPT_API_TOKEN, AI_SUMMARIZATION_API_TOKEN, AI_TRANSLATION_API_TOKEN } from '../constants/core.constant';
import { TranslationApi } from '../types/translation-api.type';

export function provideBuiltInApis(): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: AI_PROMPT_API_TOKEN,
            useFactory: () => {
                const platformId = inject(PLATFORM_ID);
                const objWindow = isPlatformBrowser(platformId) ? window : undefined;   
                return  objWindow?.ai?.languageModel ? objWindow.ai.languageModel : undefined;
            },
        },
        {
            provide: AI_TRANSLATION_API_TOKEN,
            useFactory: () => {
                const platformId = inject(PLATFORM_ID);
                const objWindow = isPlatformBrowser(platformId) ? window : undefined;
                if (objWindow && 'translation' in objWindow) {
                    return objWindow.translation as TranslationApi;
                }
                return undefined;
            },
        },
        {
            provide: AI_SUMMARIZATION_API_TOKEN,
            useFactory: () => {
                const platformId = inject(PLATFORM_ID);
                const objWindow = isPlatformBrowser(platformId) ? window : undefined;
                return objWindow?.ai?.summarizer ? objWindow.ai.summarizer : undefined;
            },
        }
    ]);
}

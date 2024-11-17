import { isPlatformBrowser } from '@angular/common';
import { EnvironmentProviders, inject, makeEnvironmentProviders, PLATFORM_ID } from '@angular/core';
import { AI_TRANSLATION_API_TOKEN } from '../constants/core.constant';
import { TranslationApi } from '../types/translation-api.type';

export function provideTranslationApi(): EnvironmentProviders {
    return makeEnvironmentProviders([
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
        }
    ]);
}

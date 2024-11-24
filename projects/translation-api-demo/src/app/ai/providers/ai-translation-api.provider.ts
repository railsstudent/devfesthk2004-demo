import { isPlatformBrowser } from '@angular/common';
import { EnvironmentProviders, inject, makeEnvironmentProviders, PLATFORM_ID } from '@angular/core';
import { AI_LANGUAGE_DETECTION_API_TOKEN, AI_TRANSLATION_API_TOKEN } from '../constants/core.constant';

export function provideTranslationApi(): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: AI_TRANSLATION_API_TOKEN,
            useFactory: () => {
                const platformId = inject(PLATFORM_ID);
                const objWindow = isPlatformBrowser(platformId) ? window : undefined;
                return objWindow?.ai?.translator ? objWindow.ai.translator : undefined;
            },
        },
        {
            provide: AI_LANGUAGE_DETECTION_API_TOKEN,
            useFactory: () => {
                const platformId = inject(PLATFORM_ID);
                const objWindow = isPlatformBrowser(platformId) ? window : undefined;
                return objWindow?.ai?.languageDetector ? objWindow?.ai?.languageDetector : undefined;
            },
        }
    ]);
}

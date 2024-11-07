import { isPlatformBrowser } from '@angular/common';
import { EnvironmentProviders, inject, makeEnvironmentProviders, PLATFORM_ID } from '@angular/core';
import { AI_LANGUAGE_DETECTION_API_TOKEN } from '../constants/core.constant';

export function provideAILanguageDetectionAPI(): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: AI_LANGUAGE_DETECTION_API_TOKEN,
            useFactory: () => {
                const platformId = inject(PLATFORM_ID);
                const objWindow = isPlatformBrowser(platformId) ? window : undefined;
                if (objWindow && 'ai' in objWindow) {
                    const ai = objWindow.ai as any;
                    if (ai.languageDetector) {
                        return ai.languageDetector;
                    }
                }
                return undefined;
            },
        }
    ]);
}
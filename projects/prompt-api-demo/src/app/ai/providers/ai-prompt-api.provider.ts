import { isPlatformBrowser } from '@angular/common';
import { EnvironmentProviders, inject, makeEnvironmentProviders, PLATFORM_ID } from '@angular/core';
import { AI_PROMPT_API_TOKEN } from '../constants/core.constant';

export function provideLanguageModel(): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: AI_PROMPT_API_TOKEN,
            useFactory: () => {
                const platformId = inject(PLATFORM_ID);
                const objWindow = isPlatformBrowser(platformId) ? window : undefined;
                if (!objWindow || !objWindow.ai) {
                    return undefined;
                }
                
                if (objWindow.ai.languageModel) {
                    return objWindow.ai.languageModel
                } else if ((objWindow.ai as any).assistant) {
                    return (objWindow.ai as any).assistant;
                }

                return undefined;
            },
        }
    ]);
}

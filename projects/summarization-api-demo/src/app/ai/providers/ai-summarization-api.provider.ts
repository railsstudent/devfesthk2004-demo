import { isPlatformBrowser } from '@angular/common';
import { EnvironmentProviders, inject, makeEnvironmentProviders, PLATFORM_ID } from '@angular/core';
import { AI_SUMMARIZATION_API_TOKEN, AISummarizationApi } from '../constants/core.constant';

export function provideSummarizationApi(): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: AI_SUMMARIZATION_API_TOKEN,
            useFactory: () => {
                const platformId = inject(PLATFORM_ID);
                const objWindow = isPlatformBrowser(platformId) ? window : undefined;
                if (objWindow && 'ai' in objWindow) {
                    const ai = objWindow.ai as any;
                    if (ai.summarizer) {
                        return ai.summarizer as AISummarizationApi;
                    }
                }
                return undefined;
            },
        }
    ]);
}

import { inject, Injectable } from '@angular/core';
import { SystemPromptService } from '../../ai/services/system-prompts.service';
import { FeedbackTranslationService } from './feedback-translation.service';
import { TranslationInput } from '../types/translation-input.type';

@Injectable({
    providedIn: 'root'
})
export class ResponseWriterService {
    #promptService = inject(SystemPromptService);
    translationService = inject(FeedbackTranslationService);

    async generateDraft({ query, sentiment, code } : TranslationInput): Promise<{ firstDraft: string, translation?: string }> {
        try {
            const firstDraft = await this.#promptService.prompt(query, sentiment);
            if (code !== 'en') {
                const translation = await this.translationService.translate(firstDraft, {
                    sourceLanguage: 'en',
                    targetLanguage: code
                });

                return {
                    firstDraft,
                    translation
                };
            }

            return { firstDraft };
        } catch (e) {
            const errMsg = e instanceof Error ? e.message : 'Error in finding the sentiment.';
            throw new Error(errMsg);
        }
    }

    destroySessions() {
        this.#promptService.destroySession();
    }
}

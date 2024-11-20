import { inject, Injectable } from '@angular/core';
import { SystemPromptService } from '../../ai/services/system-prompts.service';
import { TranslationInput } from '../types/translation-input.type';
import { FeedbackTranslationService } from './feedback-translation.service';

export const ENGLISH_CODE = 'en';

@Injectable({
    providedIn: 'root'
})
export class ResponseWriterService {
    #promptService = inject(SystemPromptService);
    #translationService = inject(FeedbackTranslationService);

    async generateDraft({ query, sentiment, code } : TranslationInput): Promise<{ firstDraft: string, translation?: string }> {
        try {
            const firstDraft = await this.#promptService.prompt(query, sentiment);
            if (code !== ENGLISH_CODE) {
                const translation = await this.#translationService.translate(firstDraft, {
                    sourceLanguage: ENGLISH_CODE,
                    targetLanguage: code
                });

                return {
                    firstDraft,
                    translation
                };
            }

            return { firstDraft };
        } catch (e) {
            const errMsg = e instanceof Error ? e.message : 'Error in generating a draft.';
            throw new Error(errMsg);
        }
    }

    async translateDraft(query: string, code: string): Promise<string> {
        try {
            if (code !== ENGLISH_CODE) {
                return this.#translationService.translate(query, {
                    sourceLanguage: ENGLISH_CODE,
                    targetLanguage: code
                });
            }

            return '';
        } catch (e) {
            const errMsg = e instanceof Error ? e.message : 'Error in finding the sentiment.';
            throw new Error(errMsg);
        }
    }

    destroySessions() {
        this.#promptService.destroySession();
    }
}

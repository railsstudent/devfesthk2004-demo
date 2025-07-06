import { inject, Injectable } from '@angular/core';
import { TranslationService } from '../../ai/services/translation.service';
import { WriterService } from '../../ai/services/writer.service';
import { TranslationInput } from '../types/sentiment-language.type';

export const ENGLISH_CODE = 'en';

@Injectable({
    providedIn: 'root'
})
export class ResponseWriterService {
    #writerService = inject(WriterService);
    #translationService = inject(TranslationService);

    async generateDraft({ translatedText, sentiment, code } : TranslationInput): Promise<{ firstDraft: string, translation?: string }> {
        try {
            const firstDraft = await this.#writerService.generateDraft(translatedText, sentiment);
            if (code !== ENGLISH_CODE) {
                const translation = await this.#translationService.translate( {
                    sourceLanguage: ENGLISH_CODE,
                    targetLanguage: code
                }, 
                firstDraft);

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

    async translateDraft(code: string, query: string): Promise<string> {
        try {
            if (code !== ENGLISH_CODE) {
                return this.#translationService.translate( {
                    sourceLanguage: ENGLISH_CODE,
                    targetLanguage: code
                }, 
                query);
            }

            return '';
        } catch (e) {
            const errMsg = e instanceof Error ? e.message : 'Error in finding the sentiment.';
            throw new Error(errMsg);
        }
    }
}

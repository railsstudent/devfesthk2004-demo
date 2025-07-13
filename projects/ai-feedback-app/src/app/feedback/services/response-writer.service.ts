import { inject, Injectable } from '@angular/core';
import { TranslationService, WriterService } from '../../ai/services';
import { TranslationInput } from '../types/sentiment-language.type';

@Injectable({
    providedIn: 'root'
})
export class ResponseWriterService {
    #writerService = inject(WriterService);
    #translationService = inject(TranslationService);

    draftChunk = this.#writerService.chunk;
    doneGenerating = this.#writerService.doneGenerating;

    translateChunk = this.#translationService.draft;
    doneTranslating = this.#translationService.doneTranslatingDraft;

    async generateDraftStream({ translatedText, sentiment } : TranslationInput): Promise<void> {
        await this.#writerService.generateDraftStream(translatedText, sentiment);
    }

    async translateDraftStream(code: string, query: string): Promise<void> {
        try {
            if (code !== 'en') {
                await this.#translationService.translateDraftStream( {
                    sourceLanguage: 'en',
                    targetLanguage: code
                }, 
                query);
                console.log('translateDraftStream done.');
            }
        } catch (e) {
            const errMsg = e instanceof Error ? e.message : 'Error in translating the draft.';
            throw new Error(errMsg);
        }
    }
}

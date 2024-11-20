import { inject, Injectable, Injector, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { TranslationService } from '../../ai/services/translation.service';
import { LanguagePair } from '../../ai/types/language-pair.type';
import { TranslationInput } from './../types/translation-input.type';
import { SummarizationService } from '../../ai/services/summarization.service';
import { AISummarizerFormat, AISummarizerLength, AISummarizerType } from '../../ai/enums/summarizer-capabilities-options.enum';

@Injectable({
    providedIn: 'root'
})
export class FeedbackTranslationService {
    #translationService = inject(TranslationService);
    #summarizationService = inject(SummarizationService);

    getLanguagePairs(translationInput: Signal<TranslationInput | undefined>, injector: Injector) {
        return toObservable(translationInput, { injector })
            .pipe(
                filter((values) => !!values),
                switchMap(({ code }) => {
                    return this.#translationService.createLanguagePairs(code)
                    .catch((e) => {
                        console.error(e);
                        return [] as LanguagePair[];
                    })
                })
            );
    }
    
    async translate(query: string, pair: LanguagePair): Promise<string> {
        try {
          return query ? await this.#translationService.translate(pair, query) : '';
        } catch (e) {
            console.error(e);
            return '';
        }
    }

    async summarize(query: string): Promise<string> {
        try {
            if (!query) {
                return '';
            }

            const sharedContext = `You are an expert that can summarize a customer's feedback`;
            return await this.#summarizationService.summarize({
                type: AISummarizerType.TLDR,
                format: AISummarizerFormat.PLAIN_TEXT,
                length: AISummarizerLength.MEDIUM,
                sharedContext,
            }, query);
        } catch (e) {
            console.error(e);
            return '';
        }
    }
}
import { inject, Injectable, Injector, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { TranslationService } from '../../ai/services/translation.service';
import { LanguagePair } from '../../ai/types/language-pair.type';
import { TranslationInput } from './../types/translation-input.type';

@Injectable({
    providedIn: 'root'
})
export class FeedbackTranslationService {
    translationService = inject(TranslationService);

    getLanguagePairs(translationInput: Signal<TranslationInput | undefined>, injector: Injector) {
        return toObservable(translationInput, { injector })
            .pipe(
                filter((values) => !!values),
                switchMap(({ code }) => {
                    return this.translationService.createLanguagePairs(code)
                    .catch((e) => {
                        console.error(e);
                        return [] as LanguagePair[];
                    })
                })
            );
    }
    
    async translate(query: string, pair: LanguagePair): Promise<string> {
        try {
          return query ? await this.translationService.translate(pair, query) : '';
        } catch (e) {
            console.error(e);
            return '';
        }
    }
}
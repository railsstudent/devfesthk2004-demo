import { Injectable, OnDestroy } from '@angular/core';
import { TRANSLATION_ERROR_CODES } from '../enums/translation-error-codes.enum';
import { LanguagePair } from '../types/language-pair.type';

@Injectable({
  providedIn: 'root'
})
export class TranslationService implements OnDestroy  {
    #constroller = new AbortController();
    
    async createLanguagePairs(sourceLanguage: string): Promise<LanguagePair[]> {
        const results: LanguagePair[] = [];
        const targetLanguage = 'en';
        if (sourceLanguage !== targetLanguage) {
            const pair: TranslatorCreateCoreOptions = { sourceLanguage, targetLanguage }
            const availability = await Translator.availability(pair);
            if (availability !== 'unavailable') {
                results.push(pair);
            }
        }

        return results;
    }

    async translate(languagePair: LanguagePair, inputText: string): Promise<string> {
        try { 
            const translator = await Translator.create({
                ...languagePair,
                signal: this.#constroller.signal,
            });

            if (!translator) {
                return '';
            }

            const result = await translator.translate(inputText, { signal: this.#constroller.signal });
            translator.destroy();

            return result;
        } catch (e) {
            console.error(e);
            return '';
        }
    }

    ngOnDestroy(): void {
        this.#constroller.abort();
    }  
}

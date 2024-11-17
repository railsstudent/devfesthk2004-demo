import { inject, Injectable, signal } from '@angular/core';
import { AI_TRANSLATION_API_TOKEN } from '../constants/core.constant';
import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';
import { TRANSLATION_ERROR_CODES } from '../enums/translation-error-codes.enum';
import { LanguagePair } from '../types/language-pair.type';

const TRANSKIT_LANGUAGES = ['en', 'es', 'zh-Hant'];

@Injectable({
  providedIn: 'root'
})
export class TranslationService  {
    #translationAPI = inject(AI_TRANSLATION_API_TOKEN);
    #detector = signal<any | null>(null);
    
    async createLanguagePairs(sourceLanguage: string): Promise<LanguagePair[]> {
        if (!this.#translationAPI) {
            throw new Error(TRANSLATION_ERROR_CODES.NO_API);
        }

        const results: LanguagePair[] = [];
        for (const targetLanguage of TRANSKIT_LANGUAGES) {
            if (sourceLanguage !== targetLanguage) {
                const pair = { sourceLanguage, targetLanguage }
                const available = await this.#translationAPI.canTranslate(pair);
                if (available !== CAPABILITIES_AVAILABLE.NO) {
                    results.push(pair);
                }
            }
        }

        return results;
    }

    async translate(languagePair: LanguagePair, inputText: string): Promise<string> {
        try { 
            if (!this.#translationAPI) {
                throw new Error(TRANSLATION_ERROR_CODES.NO_API);
            }

            const translator = await this.#translationAPI.createTranslator(languagePair);
            if (!translator) {
                return '';
            }

            const result = await translator.translate(inputText) as Promise<string>;
            if (translator.destroy) {
                translator.destroy();
            }
            return result;
        } catch (e) {
            console.error(e);
            return '';
        }
    }
}

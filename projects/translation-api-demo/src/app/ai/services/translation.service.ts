import { inject, Injectable, signal } from '@angular/core';
import { AI_TRANSLATION_API_TOKEN } from '../constants/core.constant';
import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';
import { LanguagePair, LanguagePairAvailable } from '../types/language-pair.type';

@Injectable({
  providedIn: 'root'
})
export class TranslationService  {
    #translationAPI = inject(AI_TRANSLATION_API_TOKEN);
    #detector = signal<any | null>(null);
    detector = this.#detector.asReadonly();

    supportedLanguages = ['en', 'es', 'ja', 'zh', 'zh-Hant', 'it', 'fr', 'zz'];

    async createLanguagePairs(sourceLanguage: string): Promise<LanguagePairAvailable[]> {
        if (!this.#translationAPI) {
            throw new Error(`Your browser doesn't support the Translation API. If you are on Chrome, join the Early Preview Program to enable it.`);
        }

        const results: LanguagePairAvailable[] = [];
        const api = this.#translationAPI;
        for (const targetLanguage of this.supportedLanguages) {
            if (sourceLanguage !== targetLanguage) {
                const available = await api.canTranslate({ sourceLanguage, targetLanguage }) as CAPABILITIES_AVAILABLE;
                results.push({ sourceLanguage, targetLanguage, available });
            }
        }

        return results;
    }

    async translate(languagePair: LanguagePair, inputText: string): Promise<string> {
        try { 
            if (!this.#translationAPI) {
                throw new Error(`Your browser doesn't support the Translation API. If you are on Chrome, join the Early Preview Program to enable it.`);
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

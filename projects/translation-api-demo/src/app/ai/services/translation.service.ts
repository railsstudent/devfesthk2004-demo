import { inject, Injectable, signal } from '@angular/core';
import { AI_TRANSLATION_API_TOKEN } from '../constants/core.constant';
import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';
import { ERROR_CODES } from '../enums/error-codes.enum';
import { LanguagePair, LanguagePairAvailable } from '../types/language-pair.type';

const TRANSKIT_LANGUAGES = ['en', 'es', 'ja', 'zh', 'zh-Hant', 'it', 'fr', 'zz'];

@Injectable({
  providedIn: 'root'
})
export class TranslationService  {
    #translationAPI = inject(AI_TRANSLATION_API_TOKEN);
    #detector = signal<any | null>(null);
    detector = this.#detector.asReadonly();

    async createLanguagePairs(sourceLanguage: string): Promise<LanguagePairAvailable[]> {
        if (!this.#translationAPI) {
            throw new Error(ERROR_CODES.NO_API);
        }

        const results: LanguagePairAvailable[] = [];
        for (const targetLanguage of TRANSKIT_LANGUAGES) {
            if (sourceLanguage !== targetLanguage) {
                const pair = { sourceLanguage, targetLanguage }
                const available = await this.#translationAPI.canTranslate(pair);
                if (available !== CAPABILITIES_AVAILABLE.NO) {
                    results.push({ ...pair, available });
                }
            }
        }

        return results;
    }

    async translate(languagePair: LanguagePair, inputText: string): Promise<string> {
        try { 
            if (!this.#translationAPI) {
                throw new Error(ERROR_CODES.NO_API);
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

    async downloadLanguagePackage(languagePair: LanguagePair) {
        try {
            if (!this.#translationAPI) {
                throw new Error(ERROR_CODES.NO_API);
            }
            
            const translator = await this.#translationAPI.createTranslator(languagePair);
            const available = translator ? CAPABILITIES_AVAILABLE.READILY : CAPABILITIES_AVAILABLE.NO;

            if (translator.destroy) {
                translator.destroy();
            }

            return { ...languagePair, available };
        } catch (e) {
            console.error(e);
            return { ...languagePair, available: CAPABILITIES_AVAILABLE.NO };;
        }
    }
}

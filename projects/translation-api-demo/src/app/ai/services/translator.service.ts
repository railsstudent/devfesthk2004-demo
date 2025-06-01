import { inject, Injectable } from '@angular/core';
import { AI_TRANSLATION_API_TOKEN } from '../constants/core.constant';
import { ERROR_CODES } from '../enums/error-codes.enum';
import { LanguagePair, LanguagePairAvailable } from '../types/language-pair.type';

const TRANSKIT_LANGUAGES = ['en', 'es', 'ja', 'zh', 'zh-Hant', 'it', 'fr', 'zz'];

@Injectable({
  providedIn: 'root'
})
export class TranslatorService  {
    #translationAPI = inject(AI_TRANSLATION_API_TOKEN);
    #controller = new AbortController();

    async createLanguagePairs(sourceLanguage: string): Promise<LanguagePairAvailable[]> {
        if (!this.#translationAPI) {
            throw new Error(ERROR_CODES.NO_TRANSLATION_API);
        }

        const results: LanguagePairAvailable[] = [];
        for (const targetLanguage of TRANSKIT_LANGUAGES) {
            if (sourceLanguage !== targetLanguage) {
                const capabilities = await this.#translationAPI.capabilities();
                const available = capabilities.languagePairAvailable(sourceLanguage, targetLanguage);
                if (available !== 'no') {
                    results.push({ sourceLanguage, targetLanguage, available });
                }
            }
        }
        return results;
    }

    async translate(languagePair: LanguagePair, inputText: string): Promise<string> {
        try { 
            if (!this.#translationAPI) {
                throw new Error(ERROR_CODES.NO_TRANSLATION_API);
            }

            const translator = await this.#translationAPI.create({ ...languagePair, signal: this.#controller.signal });
            if (!translator) {
                return '';
            }

            const result = await translator.translate(inputText);            
            translator.destroy();

            return result;
        } catch (e) {
            console.error(e);
            return '';
        }
    }

    async downloadLanguagePackage(languagePair: LanguagePair) {
        try {
            if (!this.#translationAPI) {
                throw new Error(ERROR_CODES.NO_TRANSLATION_API);
            }
            
            const translator = await this.#translationAPI.create({ ...languagePair, signal: this.#controller.signal });
            const capabilities = await this.#translationAPI.capabilities();
            const available = capabilities.languagePairAvailable(languagePair.sourceLanguage, languagePair.targetLanguage)

            translator.destroy();
             
            return { ...languagePair, available };
        } catch (e) {
            console.error(e);
            return { ...languagePair, available: 'no' as AICapabilityAvailability };
        }
    }
}

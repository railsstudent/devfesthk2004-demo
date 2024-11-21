import { inject, Injectable, signal } from '@angular/core';
import { AI_TRANSLATION_API_TOKEN } from '../constants/core.constant';
import { TRANSLATION_ERROR_CODES } from '../enums/translation-error-codes.enum';
import { LanguageDetectionResult } from '../types/language-detection-result.type';

@Injectable({
  providedIn: 'root'
})
export class LanguageDetectionService  {
    #translationAPI = inject(AI_TRANSLATION_API_TOKEN);
    #detector = signal<any | null>(null);

    async detect(query: string): Promise<{ code: string; name: string } | undefined> {
        if (!this.#translationAPI) {
            throw new Error(TRANSLATION_ERROR_CODES.NO_API);
        }

        if (!this.#detector()) {
            await this.createDetector()
        }

        const detector = this.#detector();
        if (!detector) {
            throw new Error(TRANSLATION_ERROR_CODES.NO_LANGUAGE_DETECTOR);
        }

        const results = (await detector.detect(query)) as LanguageDetectionResult[];
        if (!results.length) {
            return undefined;
        }

        const code = results[0].detectedLanguage;
        return { 
            code, 
            name: this.languageTagToHumanReadable(code) 
        };
    }

    private async createDetector() {
        if (this.#detector()) {
            console.log('Language Detector found.');
            return;
        }

        const canCreatStatus = (await this.#translationAPI?.canDetect()) === 'readily';
        if (!canCreatStatus) {
            throw new Error(TRANSLATION_ERROR_CODES.NO_LANGUAGE_DETECTOR);
        }
        const newDetector = await this.#translationAPI?.createDetector();
        this.#detector.set(newDetector);
    }

    private languageTagToHumanReadable(languageTag: string, targetLanguage = 'en') {
        const displayNames = new Intl.DisplayNames([targetLanguage], { type: 'language' });
        return displayNames.of(languageTag) || 'NA';
    }
}

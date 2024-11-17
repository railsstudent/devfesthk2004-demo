import { inject, Injectable, signal } from '@angular/core';
import { AI_TRANSLATION_API_TOKEN } from '../constants/core.constant';
import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';
import { TRANSLATION_ERROR_CODES } from '../enums/translation-error-codes.enum';
import { LanguageDetectionResult, LanguageDetectionWithNameResult } from '../types/language-detection-result.type';

@Injectable({
  providedIn: 'root'
})
export class LanguageDetectionService  {
    #translationAPI = inject(AI_TRANSLATION_API_TOKEN);
    #detector = signal<any | null>(null);

    async detect(query: string): Promise<string | undefined> {
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

        return this.languageTagToHumanReadable(results[0].detectedLanguage);
    }

    private async createDetector() {
        if (this.#detector()) {
            console.log('Language Detector found.');
            return;
        }

        const canCreatStatus = (await this.#translationAPI?.canDetect()) === CAPABILITIES_AVAILABLE.READILY;
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

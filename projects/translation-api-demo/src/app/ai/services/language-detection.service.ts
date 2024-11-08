import { inject, Injectable, signal } from '@angular/core';
import { AI_TRANSLATION_API_TOKEN } from '../constants/core.constant';
import { LanguageDetectionResult, LanguageDetectionWithNameResult } from '../types/language-detection-result.type';
import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';

@Injectable({
  providedIn: 'root'
})
export class LanguageDetectionService  {
    #translationAPI = inject(AI_TRANSLATION_API_TOKEN);
    #detector = signal<any | null>(null);
    detector = this.#detector.asReadonly();

    async detect(query: string, minConfidence = 0.6): Promise<LanguageDetectionWithNameResult[]> {
        if (!this.#translationAPI) {
            throw new Error(`Your browser doesn't support the Translation API. If you are on Chrome, join the Early Preview Program to enable it.`);
        }

        const detector = this.detector();
        if (!detector) {
            throw new Error('Failed to create LanguageDetector.');
        }

        const results = (await detector.detect(query)) as LanguageDetectionResult[];
        if (!results.length) {
            return [];
        }

        // choose languages for which its confidence >= 0.6
        const highConfidenceResults = results.filter((result) => result.confidence >= minConfidence);
        if (highConfidenceResults.length <= 0) {
            console.log(results[0]);
        }

        const finalLanguages = highConfidenceResults.length ? highConfidenceResults : [results[0]];
        return finalLanguages.map((result) => 
            ({ ...result, name: this.languageTagToHumanReadable(result.detectedLanguage)}));
    }

    async createDetector() {
        if (this.#detector()) {
            return;
        }

        const canCreatStatus = (await this.#translationAPI?.canDetect()) === CAPABILITIES_AVAILABLE.READILY;
        if (!canCreatStatus) {
            throw new Error('Built-in Language Detector is not available.');
        }
        const newDetector = await this.#translationAPI?.createDetector();
        this.#detector.set(newDetector);
    }

    languageTagToHumanReadable(languageTag: string, targetLanguage = 'en') {
        const displayNames = new Intl.DisplayNames([targetLanguage], { type: 'language' });
        return displayNames.of(languageTag) || 'NA';
    }
}

import { inject, Injectable, signal } from '@angular/core';
import { AI_TRANSLATION_API_TOKEN } from '../constants/core.constant';
import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';
import { ERROR_CODES } from '../enums/error-codes.enum';
import { LanguageDetectionResult, LanguageDetectionWithNameResult } from '../types/language-detection-result.type';

@Injectable({
  providedIn: 'root'
})
export class LanguageDetectionService  {
    #translationAPI = inject(AI_TRANSLATION_API_TOKEN);
    #detector = signal<any | null>(null);
    detector = this.#detector.asReadonly();

    async detect(query: string, minConfidence = 0.6): Promise<LanguageDetectionWithNameResult | undefined> {
        if (!this.#translationAPI) {
            throw new Error(ERROR_CODES.NO_API);
        }

        const detector = this.detector();
        if (!detector) {
            throw new Error('Failed to create a language detector.');
        }

        const results = (await detector.detect(query)) as LanguageDetectionResult[];
        if (!results.length) {
            return undefined;
        }

        // choose the first language for which its confidence >= minConfidence
        const highConfidenceResult = results.find((result) => result.confidence >= minConfidence);
        
        const finalLanguage = highConfidenceResult ? highConfidenceResult : results[0];
        return ({ ...finalLanguage, name: this.languageTagToHumanReadable(finalLanguage.detectedLanguage)});
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

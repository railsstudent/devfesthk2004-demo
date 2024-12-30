import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { AI_LANGUAGE_DETECTION_API_TOKEN, AI_TRANSLATION_API_TOKEN } from '../constants/core.constant';
import { ERROR_CODES } from '../enums/error-codes.enum';
import { LanguageDetectionWithNameResult } from '../types/language-detection-result.type';

@Injectable({
  providedIn: 'root'
})
export class LanguageDetectionService implements OnDestroy  {
    #translationAPI = inject(AI_TRANSLATION_API_TOKEN);
    #languageDetectionAPI = inject(AI_LANGUAGE_DETECTION_API_TOKEN);
    #detector = signal<AILanguageDetector | undefined>(undefined);
    detector = this.#detector.asReadonly();

    async detect(query: string, minConfidence = 0.6): Promise<LanguageDetectionWithNameResult | undefined> {
        if (!this.#translationAPI) {
            throw new Error(ERROR_CODES.NO_API);
        }

        const detector = this.detector();
        if (!detector) {
            throw new Error(ERROR_CODES.NO_LANGUAGE_DETECTOR);
        }

        const results = await detector.detect(query);
        if (!results.length) {
            return undefined;
        }

        // choose the first language for which its confidence >= minConfidence
        const highConfidenceResult = results.find((result) => result.confidence >= minConfidence);
        
        const finalLanguage = highConfidenceResult ? highConfidenceResult : results[0];
        return ({ ...finalLanguage, name: this.languageTagToHumanReadable(finalLanguage.detectedLanguage)});
    }

    async createDetector() {
        if (this.detector()) {
            console.log('Language Detector found.');
            return;
        }

        const canCreatStatus = (await this.#languageDetectionAPI?.capabilities())?.available === 'readily';
        if (!canCreatStatus) {
            throw new Error(ERROR_CODES.NO_LANGUAGE_DETECTOR);
        }
        const newDetector = await this.#languageDetectionAPI?.create();
        this.#detector.set(newDetector);
    }

    languageTagToHumanReadable(languageTag: string | null, targetLanguage = 'en') {
        const displayNames = new Intl.DisplayNames([targetLanguage], { type: 'language' });

        if (!languageTag) { 
            return 'NA';
        }
        return displayNames.of(languageTag) || 'NA';
    }

    ngOnDestroy(): void {
        const detector = this.detector();
        if (detector) {
            detector.destroy();
        }
    }
}

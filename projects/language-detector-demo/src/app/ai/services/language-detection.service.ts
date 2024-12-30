import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { AI_LANGUAGE_DETECTION_API_TOKEN } from '../constants/core.constant';
import { LanguageDetectionWithNameResult } from '../types/language-detection-result.type';
import { ERROR_CODES } from '../enums/errors.enum';

const MAX_LANGUAGE_RESULTS = 111;

@Injectable({
  providedIn: 'root'
})
export class LanguageDetectionService implements OnDestroy  {
    #controller = new AbortController();

    #languageDetectionAPI = inject(AI_LANGUAGE_DETECTION_API_TOKEN);
    #detector = signal<AILanguageDetector| undefined>(undefined);
    detector = this.#detector.asReadonly();
    #capabilities = signal<AILanguageDetectorCapabilities | null>(null);
    capabilities = this.#capabilities.asReadonly();

    async detect(query: string, topNResults = 3): Promise<LanguageDetectionWithNameResult[]> {
        if (!this.#languageDetectionAPI) {
            throw new Error(ERROR_CODES.NO_API);
        }

        const detector = this.detector();
        if (!detector) {
            throw new Error('Failed to create the LanguageDetector.');
        }

        const minTopNReesults = Math.min(topNResults, MAX_LANGUAGE_RESULTS);
        const results = await detector.detect(query);
        const probablyLanguages = results.slice(0, minTopNReesults);
        return probablyLanguages.map((item) => ({ ...item, name: this.languageTagToHumanReadable(item.detectedLanguage) }))
    }

    destroyDetector() {
        this.#capabilities.set(null);
        this.resetDetector();
    }

    private resetDetector() {
        const detector = this.detector();

        if (detector) {
            detector.destroy();
            console.log('Destroy the language detector.');
            this.#detector.set(undefined);
        }
    }

    async createDetector() {
        if (!this.#languageDetectionAPI) {
            throw new Error(ERROR_CODES.NO_API);
        }

        this.resetDetector();
        const [capabilities, newDetector]  = await Promise.all([
            this.#languageDetectionAPI.capabilities(),
            this.#languageDetectionAPI.create({ signal: this.#controller.signal })
        ]);
        this.#capabilities.set(capabilities);
        this.#detector.set(newDetector);
    }

    languageTagToHumanReadable(languageTag: string | null, targetLanguage = 'en') {
        const displayNames = new Intl.DisplayNames([targetLanguage], { type: 'language' });
        if (languageTag) {
            return displayNames.of(languageTag) || 'NA';
        }

        return 'NA';
    }

    ngOnDestroy(): void {
        const detector = this.detector();
        if (detector) {
            detector.destroy();
        }
    }
}

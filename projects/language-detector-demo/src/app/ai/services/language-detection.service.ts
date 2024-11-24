import { inject, Injectable, signal } from '@angular/core';
import { AI_LANGUAGE_DETECTION_API_TOKEN } from '../constants/core.constant';
import { LanguageDetectionWithNameResult } from '../types/language-detection-result.type';

const MAX_LANGUAGE_RESULTS = 111;

@Injectable({
  providedIn: 'root'
})
export class LanguageDetectionService  {
    #controller = new AbortController();

    #languageDetectionAPI = inject(AI_LANGUAGE_DETECTION_API_TOKEN);
    #detector = signal<AILanguageDetector| undefined>(undefined);
    detector = this.#detector.asReadonly();
    #capabilities = signal<AILanguageDetectorCapabilities | null>(null);
    capabilities = this.#capabilities.asReadonly();

    async createCapabilities() {
        if (!this.#languageDetectionAPI) {
            throw new Error(`Your browser doesn't support the Prompt API. If you are on Chrome, join the Early Preview Program to enable it.`);
        }
        const capabilities = await this.#languageDetectionAPI.capabilities();
        this.#capabilities.set(capabilities);
    }

    async destroyCapabilities() {
        this.#capabilities.set(null);
    }

    async detect(query: string, topNResults = 3): Promise<LanguageDetectionWithNameResult[]> {
        if (!this.#languageDetectionAPI) {
            throw new Error(`Your browser doesn't support the Language Detection API. If you are on Chrome, join the Early Preview Program to enable it.`);
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
        const detector = this.detector();

        if (detector) {
            detector.destroy();
            console.log('Destroy the language detector.');
            this.#detector.set(undefined);
        }
    }

    async createDetector() {
        this.destroyDetector();
        const newDetector = await this.#languageDetectionAPI?.create({ signal: this.#controller.signal });
        this.#detector.set(newDetector);
    }

    languageTagToHumanReadable(languageTag: string | null, targetLanguage = 'en') {
        const displayNames = new Intl.DisplayNames([targetLanguage], { type: 'language' });
        if (languageTag) {
            return displayNames.of(languageTag) || 'NA';
        }

        return 'NA';
    }
}

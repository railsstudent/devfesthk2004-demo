import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { LanguageDetectionWithNameResult } from '../types/language-detection-result.type';
import { getLanguageDetectorAPIAvailability } from '../utils/ai-detection';

@Injectable({
  providedIn: 'root'
})
export class LanguageDetectionService implements OnDestroy  {
    #controller = new AbortController();

    #detector = signal<LanguageDetector| undefined>(undefined);
    detector = this.#detector.asReadonly();
    inputQuota = computed(() => {
        const detector = this.detector();
        return detector ? detector.inputQuota : 0;
    });

    async detect(query: string, topNResults = 3): Promise<LanguageDetectionWithNameResult[]> {
        const detector = this.detector();
        if (!detector) {
            throw new Error('Failed to create the LanguageDetector.');
        }

        try {
            const results = await detector.detect(query);
            const minTopNReesults = Math.min(topNResults, results.length);
            const probablyLanguages = results.slice(0, minTopNReesults);
            return probablyLanguages.map((item) => ({ ...item, name: this.languageTagToHumanReadable(item.detectedLanguage) }))
        } catch (e) {
            if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                console.error('LanguageDetector API quota exceeded. Please try again later.');
            } else if (e instanceof Error) {
                console.error(e);
            }

            return [];
        }
    }

    destroyDetector() {
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
        this.resetDetector();
        
        const newDetector = await this.createDetectorWithMonitor();
        this.#detector.set(newDetector);
    }

    private async createDetectorWithMonitor() {
        const availability = await getLanguageDetectorAPIAvailability();

        const expectedInputLanguages = ['es', 'en', 'zh', 'de', 'pt'];
        const monitor = availability === 'available' ? undefined :
            (m: CreateMonitor) => m.addEventListener('downloadprogress', (e) => 
                console.log(`Downloaded ${e.loaded * 100}%`)
            );

        const newDetector = await LanguageDetector.create({
            monitor,
            signal: this.#controller.signal,
            expectedInputLanguages
        });
        return newDetector;
    }

    languageTagToHumanReadable(languageTag: string | undefined, targetLanguage = 'en') {
        const displayNames = new Intl.DisplayNames([targetLanguage], { type: 'language' });
        if (languageTag) {
            return displayNames.of(languageTag) || 'N/A';
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

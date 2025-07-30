import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { LanguageDetectionWithNameResult } from '../types/language-detection-result.type';
import { getLanguageDetectorAPIAvailability } from '../utils/ai-detection';

@Injectable({
  providedIn: 'root'
})
export class LanguageDetectionService implements OnDestroy  {
    #controller = new AbortController();

    #detector = signal<LanguageDetector| undefined>(undefined);
    inputQuota = computed(() => {
        const detector = this.#detector();
        return detector ? detector.inputQuota : 0;
    });
    #usage = signal(0);
    usage = this.#usage.asReadonly();

    async detect(query: string, topNResults = 3): Promise<LanguageDetectionWithNameResult[]> {
        const detector = this.#detector() ? this.#detector() : await this.createDetector();
        if (!detector) {
            return [];
        }

        try {
            const usage = await detector.measureInputUsage(query);
            this.#usage.set(usage);
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

    async createDetector() {
        if (this.#detector()) {
            return this.#detector();
        }
        
        const newDetector = await this.createDetectorWithMonitor();
        this.#detector.set(newDetector);

        return this.#detector();
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
        const detector = this.#detector();
        if (detector) {
            detector.destroy();
        }
    }
}

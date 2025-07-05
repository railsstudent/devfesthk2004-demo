import { Injectable, OnDestroy, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageDetectionService implements OnDestroy  {
    #detector = signal<LanguageDetector | undefined>(undefined);
    #controller = new AbortController();

    async detect(query: string): Promise<{ code: string; name: string } | undefined> {
        if (!this.#detector()) {
            const newDetector = await LanguageDetector.create({ 
                signal: this.#controller.signal 
            });
            this.#detector.set(newDetector);
        }

        const detector = this.#detector() as LanguageDetector;
        const results = await detector.detect(query, { signal: this.#controller.signal });
        if (!results.length) {
            return undefined;
        }

        const code = results[0].detectedLanguage;
        if (!code) {
            return undefined;
        }

        return { 
            code, 
            name: this.languageTagToHumanReadable(code) 
        };
    }

    private languageTagToHumanReadable(languageTag: string, targetLanguage = 'en') {
        const displayNames = new Intl.DisplayNames([targetLanguage], { type: 'language' });
        return displayNames.of(languageTag) || 'NA';
    }

    ngOnDestroy(): void {
        this.#controller.abort();

        const detector = this.#detector();
        if (detector) {
            console.log('Destroying the language detector.');
            detector.destroy();
            this.#detector.set(undefined);
        }
    }
}

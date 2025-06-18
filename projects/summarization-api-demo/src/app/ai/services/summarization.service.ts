import { computed, Injectable, signal } from '@angular/core';
import { SummarizerSelectOptions } from '../types/summarizer-select-options.type';
import { getAvailability } from '../utils/ai-detection';

const formats: SummarizerFormat[] = ['plain-text', 'markdown'];
const types: SummarizerType[] = ['headline', 'key-points', 'teaser', 'tldr'];
const lengths: SummarizerLength[] = ['long', 'medium', 'short'];

@Injectable({
    providedIn: 'root'    
})
export class SummarizationService {
    #abortController = new AbortController();
    #summaries = signal<string[]>([]);
    summaries = this.#summaries.asReadonly();
    #error = signal('');
    error = this.#error.asReadonly();
    #availability = signal(false);
    availability = this.#availability.asReadonly();

    summarizerOptions = computed<SummarizerSelectOptions>(() => ({
        formats,
        lengths,
        types,
    }));

    async summarize(options: SummarizerCreateCoreOptions, ...texts: string[]) {

        try {
            this.#summaries.set([]);
            this.#error.set('');

            const availability = await getAvailability(options);
            this.#availability.set(true);
            const monitorCallback = availability === 'available' ? undefined : 
                (monitor: CreateMonitor) => monitor.addEventListener("downloadprogress", (e) => {
                    console.log(`download progress: ${e.loaded * 100}%`);
                });

            const summarizer = await Summarizer.create({
                ...options,
                monitor: monitorCallback,
                signal: this.#abortController.signal
            });
            
            const promises = texts.map((text) => summarizer.summarize(text))
            const summarizedTexts = await Promise.all(promises);

            this.#summaries.set(summarizedTexts);
            summarizer.destroy();
        } catch (e) {
            this.#availability.set(false);
            this.#error.set(e instanceof Error ? e.message : 'unknown');
        }
    }
}

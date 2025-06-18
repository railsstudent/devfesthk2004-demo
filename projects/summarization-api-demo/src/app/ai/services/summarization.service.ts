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

    async isOptionSupported(languageFlags: string[]): Promise<string[]> {
        const capabilities = await this.initCapabilities();
        return languageFlags.map((flag) => 
            `capabilities.languageAvailable(${flag}) = ${capabilities.languageAvailable(flag)}`
        );
    }

    async summarize(options: SummarizerCreateOptions, ...texts: string[]) {
        this.#summaries.set([]);

        const session = await this.validateAndReturnApi().create({ ...options, 
            signal: this.#abortController.signal })
        
        const isAvailable = await this.createOptionsAvalable(options);
        if (!isAvailable) {
            return;
        }
        
        const summarizedTexts: string[] = [];
        for (const text of texts) {
            summarizedTexts.push(await session.summarize(text));
        }

        this.#summaries.set(summarizedTexts);
        session.destroy();
    }
}

import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { SummarizerSelectOptions } from '../types/summarizer-select-options.type';
import { getAvailability } from '../utils/ai-detection';

const formats: SummarizerFormat[] = ['plain-text', 'markdown'];
const types: SummarizerType[] = ['headline', 'key-points', 'teaser', 'tldr'];
const lengths: SummarizerLength[] = ['long', 'medium', 'short'];

@Injectable({
    providedIn: 'root'    
})
export class SummarizationService implements OnDestroy {
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

    private readonly errors: Record<string, string> = {
        'InvalidStateError': 'The document is not active. Please try again later.',
        'NotAllowedError': 'The Summarizer API is blocked.',
        'NotSupportedError': 'The Summarizer does not support the language of the context.',
        'NotReadableError': 'The output is unreadable, could be harmful, inaccurate, or nonsensical.',
        'QuotaExceededError': 'Summarizer API Quota exceeded. Please try again later.',
        'UnknownError': 'Unknown error occurred while using the summarizer.',
    }
    
    private handleErrors(e: unknown) {
        if (e == null) {
            console.error('Error was null.', e);
            this.#error.set('Error was null.');
            return;
        }

        if (!(e instanceof DOMException) && !(e instanceof Error)) {
            console.error('Error was not an instance of DOMException or Error.', e);
            this.#error.set('Error was not an instance of DOMException or Error.');
            return;
        }

        if (e instanceof DOMException) {
            const error = this.errors[e.name];
            if (error == null) {
                console.error(`Error code not found for ${e.name}`, e);
                this.#error.set(`Error code not found for ${e.name}`);
                return;
            }

            console.error(error, e);
            this.#error.set(error);
        } else {
            console.error(e.message, e);
            this.#error.set(e.message);
        }
    }

    async summarize(options: SummarizerCreateCoreOptions, ...texts: string[]) {
        this.#summaries.set([]);
        this.#error.set('');

        try {
            const availability = await getAvailability(options);
            this.#availability.set(availability === 'available');

            const summarizer = await Summarizer.create({
                ...options,
                signal: this.#abortController.signal,
                monitor: availability === 'available' ? undefined : (monitor) => monitor.addEventListener('downloadprogress', (e) => {
                    const percentage = Math.floor(e.loaded * 100);
                    console.log(`Summarizer: Downloaded ${percentage}%`);
                })
            });

            const summarizedTexts = await Promise.all(texts.map(text => summarizer.summarize(text)));
            this.#summaries.set(summarizedTexts);
            summarizer.destroy();
        } catch (e) {
            this.#availability.set(false);
            this.handleErrors(e);
        }
    }

    #chunks = signal('');
    chunks = this.#chunks.asReadonly();

    #chunk = signal('');
    chunk = this.#chunk.asReadonly();

    #isSummarizing = signal(false);
    isSummarizing = this.#isSummarizing.asReadonly();

    async summarizeStream(options: SummarizerCreateCoreOptions, text: string) {
        this.#error.set('');
        this.#chunk.set('');
        this.#chunks.set('');
        this.#isSummarizing.set(true);

        try {
            const availability = await getAvailability(options);
            this.#availability.set(availability === 'available');

            const summarizer = await Summarizer.create({
                ...options,
                signal: this.#abortController.signal,
                monitor: availability === 'available' ? undefined : (monitor) => monitor.addEventListener('downloadprogress', (e) => {
                    const percentage = Math.floor(e.loaded * 100);
                    console.log(`Summarizer: Downloaded ${percentage}%`);
                })
            });

            const stream = summarizer.summarizeStreaming(text, { 
                signal: this.#abortController.signal
            });

            for await (const chunk of stream) {
                this.#chunks.update((prev) => prev + chunk);
                this.#chunk.set(chunk);
            }

            summarizer.destroy();
        } catch (e) {
            this.#availability.set(false);
            this.handleErrors(e);
        } finally {
            this.#isSummarizing.set(false);
        }
    }

    ngOnDestroy(): void {
        this.#abortController.abort();
    }
}

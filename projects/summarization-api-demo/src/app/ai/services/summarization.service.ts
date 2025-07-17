import { Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import { getAvailability } from '../utils/ai-detection';

@Injectable({
    providedIn: 'root'    
})
export class SummarizationService implements OnDestroy {
    #abortController = new AbortController();
    #error = signal('');
    error = this.#error.asReadonly();

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

    async checkAvailability(options: SummarizerCreateCoreOptions) {
        try {
            const availability = await getAvailability(options);
            return availability === 'available';
        } catch (e) {
            this.handleErrors(e);
            return false;
        }
    }

    async createSummarizer(options: SummarizerCreateCoreOptions) {
        try {
            const availability = await getAvailability(options);
            const summarizer = await Summarizer.create({
                ...options,
                signal: this.#abortController.signal,
                monitor: availability === 'available' ? undefined : (monitor) => monitor.addEventListener('downloadprogress', (e) => {
                    const percentage = Math.floor(e.loaded * 100);
                    console.log(`Summarizer: Downloaded ${percentage}%`);
                })
            });

            return summarizer;
        } catch (e) {
            this.handleErrors(e);
            return undefined;
        }
    }

    createChunkStreamReader() {
        return (summarizer: Summarizer, content: string, chunk: WritableSignal<string>, isSummarizing: WritableSignal<boolean>) => {
            const stream = summarizer.summarizeStreaming(content, {
                signal: this.#abortController.signal,
            });
      
            const reader = stream.getReader();
            reader.read()
                .then(function processText({ value, done }): any {
                    if (done) {
                        return;
                    }
                    
                    chunk.set(value);
                    return reader.read().then(processText);
                })
                .catch((err) => {
                    console.error(err);
                    if (err instanceof Error) {
                        throw err;
                    }
                    throw new Error('Error in streaming the draft.');
                })
                .finally(() => {
                    summarizer?.destroy();
                    isSummarizing.set(false);
                });
        }
    }

    ngOnDestroy(): void {
        this.#abortController.abort();
    }
}

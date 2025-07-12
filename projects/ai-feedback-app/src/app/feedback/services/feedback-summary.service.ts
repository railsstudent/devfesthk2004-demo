import { Injectable, OnDestroy, signal } from '@angular/core';
import { SUMMARIZER_OPTIONS } from '../../ai/constants/summarizer.constant';

@Injectable({
    providedIn: 'root'
})
export class FeedbackSummaryService implements OnDestroy {
    #controller = new AbortController();
    
    #chunk = signal<string>('');
    chunk = this.#chunk.asReadonly();
    #done = signal(false);
    done = this.#done.asReadonly();

    async summarizeStream(text: string): Promise<void> {        
        const summarizerOptions: SummarizerCreateOptions = {
            ...SUMMARIZER_OPTIONS,
            signal: this.#controller.signal,
        };

        const summarizer = await Summarizer.create(summarizerOptions);
        const stream = await summarizer.summarizeStreaming(
            text, 
            { signal: this.#controller.signal }
        );

        const self = this;
        const reader = stream.getReader();
        reader.read()
            .then(function processText({ value, done }): any {
                if (done) {
                    self.#done.set(done);
                    return;
                }

                self.#chunk.update((prev) => prev + value);
                return reader.read().then(processText);
            })
            .catch((err) => {
                console.error(err);
                if (err instanceof Error) {
                    throw err;
                }
                throw new Error('Error in streaming the summary.');
            })
            .finally(() => {
                if (summarizer) {
                    console.log('Destroying the summarizer.');
                    summarizer.destroy();
                }
            });
    }

    ngOnDestroy(): void {
        this.#controller.abort();
    }
}
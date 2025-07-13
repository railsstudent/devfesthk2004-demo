import { Injectable, OnDestroy, signal } from '@angular/core';
import { SUMMARIZER_OPTIONS } from '../../ai/constants/summarizer.constant';
import { streamTextUtil } from '../../ai/utils/string-stream-reader.until';

@Injectable({
    providedIn: 'root'
})
export class FeedbackSummaryService implements OnDestroy {
    #controller = new AbortController();
    
    #chunk = signal<string>('');
    chunk = this.#chunk.asReadonly();
    #done = signal(false);
    done = this.#done.asReadonly();

    streamString = streamTextUtil();

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

        await this.streamString(stream, this.#chunk, this.#done, summarizer);
    }

    ngOnDestroy(): void {
        this.#controller.abort();
    }
}
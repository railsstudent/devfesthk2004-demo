import { WritableSignal } from '@angular/core';

export type SummarizerReaderOptions = {
    summarizer: Summarizer;
    content: string;
    chunk: WritableSignal<string>;
    isSummarizing: WritableSignal<boolean>;
}

import { WritableSignal } from '@angular/core'

export type SummarizerReaderOptions = {
    summarizer: Summarizer;
    content: string;
    chunks: WritableSignal<string>;
    chunk: WritableSignal<string>;
    isSummarizing: WritableSignal<boolean>;
    isStreaming: boolean;
}

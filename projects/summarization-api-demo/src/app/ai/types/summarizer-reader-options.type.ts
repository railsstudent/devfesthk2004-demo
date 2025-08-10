import { ResourceStreamItem, WritableSignal } from '@angular/core';

export type SummarizerReaderOptions = {
    summarizer: Summarizer;
    content: string;
    chunk: WritableSignal<ResourceStreamItem<string | undefined>>;
    isSummarizing: WritableSignal<boolean>;
}

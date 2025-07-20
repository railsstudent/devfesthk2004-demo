import { WritableSignal } from '@angular/core';
import { Mode } from './summarizer-mode.type';

export type SummarizerReaderOptions = {
    summarizer: Summarizer;
    content: string;
    chunk: WritableSignal<string>;
    isSummarizing: WritableSignal<boolean>;
    mode: Mode;
}

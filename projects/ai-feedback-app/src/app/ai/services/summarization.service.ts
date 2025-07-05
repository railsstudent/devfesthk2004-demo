import { inject, Injectable, OnDestroy } from '@angular/core';
import { SUMMARIZER_OPTIONS } from '../constants/summarizer.constant';
import { LanguageDetectionService } from './language-detection.service';

@Injectable({
    providedIn: 'root'    
})
export class SummarizationService implements OnDestroy {
    #controller = new AbortController();
    languageDetectionService = inject(LanguageDetectionService);
    
    async summarize(text: string): Promise<string> {        
        const summarizerOptions: SummarizerCreateOptions = {
            ...SUMMARIZER_OPTIONS,
            signal: this.#controller.signal,
        };

        const summarizer = await Summarizer.create(summarizerOptions);
        const summary = await summarizer.summarize(text, { signal: this.#controller.signal });
        summarizer.destroy();

        return summary;
    }

    ngOnDestroy(): void {
        this.#controller.abort();
    }
}

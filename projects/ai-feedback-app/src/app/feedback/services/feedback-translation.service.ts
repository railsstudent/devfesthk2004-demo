import { inject, Injectable } from '@angular/core';
import { SummarizationService } from '../../ai/services/summarization.service';
import { TranslationService } from '../../ai/services/translation.service';


@Injectable({
    providedIn: 'root'
})
export class FeedbackTranslationService {
    #summarizationService = inject(SummarizationService);

    async summarize(query: string): Promise<string> {
        try {
            if (!query) {
                return '';
            }

            // const sharedContext = `You are an expert that can summarize a customer's feedback. 
            // If the text is not in English, please return a blank string.`;
            return await this.#summarizationService.summarize(query);
        } catch (e) {
            console.error(e);
            return '';
        }
    }
}
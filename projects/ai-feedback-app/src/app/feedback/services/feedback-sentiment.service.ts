import { inject, Injectable } from '@angular/core';
import { PromptService } from '../../ai/services/prompt.service';
import { LanguageDetectionService } from '../../ai/services/language-detection.service';
import { SentimentLanguage } from '../types/sentiment-language.type';

@Injectable({
    providedIn: 'root'
})
export class FeedbackSentimentService {
    promptService = inject(PromptService);
    languageDetectionService = inject(LanguageDetectionService);

    detectSentimentAndLanguage(query: string): Promise<SentimentLanguage | undefined> {
        return Promise.allSettled([
            this.promptService.prompt(query), 
            this.languageDetectionService.detect(query)
        ]).then(([ promptResult, languageResult ]) => {
            if (promptResult.status === 'fulfilled' && languageResult.status === 'fulfilled'
                && languageResult.value) {
                return {
                    sentiment: promptResult.value,
                    code: languageResult.value.code,
                    language: languageResult.value.name,
                }
            }
            return undefined
        }).catch((e) => {
            const errMsg = e instanceof Error ? e.message : 'Error in finding the sentiment.';
            throw new Error(errMsg);
        });
    }

    destroySessions() {
        this.promptService.destroySession();
    }
}

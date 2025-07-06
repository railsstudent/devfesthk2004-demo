import { inject, Injectable } from '@angular/core';
import { LanguageDetectionService } from '../../ai/services/language-detection.service';
import { NShotPromptService } from '../../ai/services/n-shot-prompt.service';
import { TranslationService } from '../../ai/services/translation.service';
import { TranslatedFeedback, TranslatedFeedbackWithSentiment } from '../types/sentiment-language.type';

@Injectable({
    providedIn: 'root'
})
export class FeedbackSentimentService {
    #promptService = inject(NShotPromptService);
    #languageDetectionService = inject(LanguageDetectionService);
    #translationService = inject(TranslationService);

    private async translateFeedback(text: string): Promise<TranslatedFeedback | undefined> {
        const feedbackLanguage = await this.#languageDetectionService.detect(text);
        if (!feedbackLanguage) {
            return undefined;
        }

        const code = feedbackLanguage.code;
        const language = feedbackLanguage.name;

        let translatedText = '';
        if (code !== 'en') {
            const pair = { 
                sourceLanguage: code,
                targetLanguage: 'en'
            };
            translatedText = await this.#translationService.translate(pair, text);
        }

        console.log('original text', text);
        console.log('translated text', translatedText);
        return {
            code,
            language,
            text: translatedText || text,
        }
    }

    async detectSentimentAndLanguage(text: string): Promise<TranslatedFeedbackWithSentiment | undefined> {
        try {
            const enFeedback = await this.translateFeedback(text);
            if (!enFeedback) {
                return undefined;
            }

            // determine sentiment for the English feedback
            const sentiment = await this.#promptService.prompt(text);
            return {
                sentiment,
                code: enFeedback.code,
                language: enFeedback.language,
                text: enFeedback.text,
            }
        } catch (e) {
            const errMsg = e instanceof Error ? e.message : 'Error in finding the sentiment.';
            throw new Error(errMsg);
        }
    }
}

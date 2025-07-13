import { inject, Injectable, signal } from '@angular/core';
import { LanguageDetectionService } from '../../ai/services/language-detection.service';
import { NShotPromptService } from '../../ai/services/n-shot-prompt.service';
import { TranslationService } from '../../ai/services/translation.service';
import { LanguagePair } from '../../ai/types/language-pair.type';

@Injectable({
    providedIn: 'root'
})
export class FeedbackSentimentService {
    #promptService = inject(NShotPromptService);
    #languageDetectionService = inject(LanguageDetectionService);
    #translationService = inject(TranslationService);

    #sourceLanguage = signal<{ code: string; name: string; targetCode: string} | undefined>(undefined);
    sourceLanguage = this.#sourceLanguage.asReadonly();
    
    done = this.#translationService.done;
    translation = this.#translationService.chunk;

    #sentimentDone = signal(false);
    sentimentDone = this.#sentimentDone.asReadonly();

    async translateFeedbackStream(text: string): Promise<void> {
        const feedbackLanguage = await this.#languageDetectionService.detect(text);
        if (!feedbackLanguage) {
            return;
        }

        const code = feedbackLanguage.code;
        const language = feedbackLanguage.name;

        this.#sourceLanguage.set({ code, name: language, targetCode: 'en' });

        const pair: LanguagePair = { 
            sourceLanguage: code,
            targetLanguage: 'en'
        };

        await this.#translationService.translateStream(pair, language, text);
    }

    async detectSentiment(text: string) {
        try {
            if (!text) {
                throw new Error('Error in finding sentiment, the input text is blank.');
            }

            this.#sentimentDone.set(false);

            // determine sentiment for the English feedback
            const sentiment = await this.#promptService.prompt(text);
            
            if (!['positive', 'negative', 'not sure'].includes(sentiment)) {
                throw new Error('Error in finding sentiment, the input text is blank.');
            }

            return sentiment;
        } catch (e) {
            const errMsg = e instanceof Error ? e.message : 'Error in finding the sentiment.';
            throw new Error(errMsg);
        } finally {
            this.#sentimentDone.set(true);
        }
    }
}

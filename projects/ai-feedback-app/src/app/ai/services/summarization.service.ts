import { inject, Injectable } from '@angular/core';
import { AI_SUMMARIZATION_API_TOKEN } from '../constants/core.constant';
import { LanguageDetectionService } from './language-detection.service';

enum ERROR_CODES {
    NO_API = `Your browser doesn't support the Summarization API. If you are on Chrome, join the Early Preview Program to enable it.`,
    NO_CAPABILITIES = 'Capabilities detection is unsupported. Please check your configuration in chrome://flags/#optimization-guide-on-device-model',
}

@Injectable({
    providedIn: 'root'    
})
export class SummarizationService {
    #summarizationApi = inject(AI_SUMMARIZATION_API_TOKEN);
    #abortController = new AbortController();
    languageDetectionService = inject(LanguageDetectionService);

    private validateAndReturnApi() {
        if (!this.#summarizationApi) {
            throw new Error(ERROR_CODES.NO_API);
        } else if (!this.#summarizationApi.capabilities) {
            throw new Error(ERROR_CODES.NO_CAPABILITIES);
        }

        return this.#summarizationApi;
    }

    private initCapabilities() {
        const api = this.validateAndReturnApi();
        return api.capabilities();
    }

    private initSession(options: AISummarizerCreateOptions) {
        const api = this.validateAndReturnApi();
        return api.create(options);
    }

    private async languageAvailable(languageFlag: string): Promise<AICapabilityAvailability> {
        const capabilities = await this.initCapabilities();
        return (capabilities as any).languageAvailable(languageFlag);
    }

    async canSummarize(text: string): Promise<boolean> {
        const languageDected = await this.languageDetectionService.detect(text);
        if (!languageDected) {
            throw new Error('Failed to detect the language of the text.');
        }

        const availableStatus = await this.languageAvailable(languageDected.code);
        return availableStatus === 'readily';
    }
    
    async summarize(options: AISummarizerCreateOptions, text: string) {
        if (!this.canSummarize(text)) {
            throw new Error('The summarization API does not support the language of the text.');
        }

        const capabilities = await this.initCapabilities();
        await this.validateCreateOptions(options, capabilities);
        
        const session = await this.initSession({ ...options, signal: this.#abortController.signal });        
        const result = await session.summarize(text);

        session.destroy();
        return result;
    }

    private async validateCreateOptions(options: AISummarizerCreateOptions, capabilities: AISummarizerCapabilities) {
        if (options.format) {
            const formatStatus = await capabilities.supportsFormat(options.format);
            if (formatStatus !== 'readily') {
                throw new Error(`Summarization API does not ${options.format} format`);
            }
        }

        if (options.length) {
            const lengthStatus = await capabilities.supportsLength(options.length);
            if (lengthStatus !== 'readily') {
                throw new Error(`Summarization API does not ${options.length} format`);
            }
        }

        if (options.type) {
            const typeStatus = await capabilities.supportsType(options.type);
            if (typeStatus !== 'readily') {
                throw new Error(`Summarization API does not ${options.type} format`);
            }
        }
    }
}

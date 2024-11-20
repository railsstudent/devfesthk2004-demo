import { inject, Injectable, signal } from '@angular/core';
import { AI_SUMMARIZATION_API_TOKEN } from '../constants/core.constant';
import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';
import { isCapabilitiesApi } from '../guards/capabilities-api.guard';
import { isOldCapabilitiesApi } from '../guards/old-capabilities-api.guard';
import { AISummarizerCreateOptions } from '../types/create-summarizer-options.type';
import { CapabilitiesApi, OldCapabilitiesApi } from '../types/summarizer-api-definition.type';
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

    private async languageAvailable(languageFlag: string): Promise<CAPABILITIES_AVAILABLE> {
        const capabilities = await this.initCapabilities();
        return capabilities.languageAvailable(languageFlag);
    }

    async canSummarize(text: string): Promise<boolean> {
        const languageDected = await this.languageDetectionService.detect(text);
        if (!languageDected) {
            throw new Error('Failed to detect the language of the text.');
        }

        const availableStatus = await this.languageAvailable(languageDected.code);
        return availableStatus === CAPABILITIES_AVAILABLE.READILY;
    }
    
    async summarize(options: AISummarizerCreateOptions, text: string) {
        if (!this.canSummarize(text)) {
            throw new Error('The summarization API does not support the language of the text.');
        }

        const capabilities = await this.initCapabilities();
        if (isOldCapabilitiesApi(capabilities)) {
            await this.validateCreateOptionsOld(options, capabilities);
        } else if (isCapabilitiesApi(capabilities)) {
            await this.validateCreateOptionsNew(options, capabilities);
        }
        
        const session = await this.initSession({ ...options, signal: this.#abortController.signal });        
        const result = await session.summarize(text);

        session.destroy();
        return result;
    }

    private async validateCreateOptionsNew(options: AISummarizerCreateOptions, capabilities: CapabilitiesApi) {
        if (options.format) {
            const formatStatus = await capabilities.createOptionsAvailable({
                format: options.format
            });
            if (formatStatus !== CAPABILITIES_AVAILABLE.READILY) {
                throw new Error(`Summarization API does not ${options.format} format`);
            }
        }

        if (options.length) {
            const lengthStatus = await capabilities.createOptionsAvailable({
                length: options.length
            });
            if (lengthStatus !== CAPABILITIES_AVAILABLE.READILY) {
                throw new Error(`Summarization API does not ${options.length} format`);
            }
        }

        if (options.type) {
            const typeStatus = await capabilities.createOptionsAvailable({
                type: options.type
            });
            if (typeStatus !== CAPABILITIES_AVAILABLE.READILY) {
                throw new Error(`Summarization API does not ${options.type} format`);
            }
        }
    }

    private async validateCreateOptionsOld(options: AISummarizerCreateOptions, capabilities: OldCapabilitiesApi) {
        if (options.format) {
            const formatStatus = await capabilities.supportsFormat(options.format);
            if (formatStatus !== CAPABILITIES_AVAILABLE.READILY) {
                throw new Error(`Summarization API does not ${options.format} format`);
            }
        }

        if (options.length) {
            const lengthStatus = await capabilities.supportsLength(options.length);
            if (lengthStatus !== CAPABILITIES_AVAILABLE.READILY) {
                throw new Error(`Summarization API does not ${options.length} format`);
            }
        }

        if (options.type) {
            const typeStatus = await capabilities.supportsType(options.type);
            if (typeStatus !== CAPABILITIES_AVAILABLE.READILY) {
                throw new Error(`Summarization API does not ${options.type} format`);
            }
        }
    }
}

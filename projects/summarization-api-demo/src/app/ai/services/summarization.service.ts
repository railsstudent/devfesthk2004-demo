import { inject, Injectable, signal } from '@angular/core';
import { AI_SUMMARIZATION_API_TOKEN } from '../constants/core.constant';
import { AISummarizerFormat, AISummarizerLength, AISummarizerType } from '../enums/capabilities-core-options.enum';
import { AISummarizerCreateOptions } from '../types/create-summarizer-options.type';
import { CapabilitiesApi, OldCapabilitiesApi } from '../types/summarizer-api-definition.type';

@Injectable({
    providedIn: 'root'    
})
export class SummarizationService {
    #summarizationApi = inject(AI_SUMMARIZATION_API_TOKEN);
    #abortController = new AbortController();
    #summary = signal<string>('');
    summary = this.#summary.asReadonly();

    private initCapabilities() {
        if (!this.#summarizationApi) {
            throw new Error(`Your browser doesn't support the Summarization API. If you are on Chrome, join the Early Preview Program to enable it.`);
        } else if (!this.#summarizationApi.capabilities) {
            throw new Error('Capabilities detection is unsupported. Please check your configuration in chrome://flags/#optimization-guide-on-device-model');
        }

        return this.#summarizationApi.capabilities();
    }

    async checkSummarizerFormats(): Promise<string[]> {
        const capabilities = await this.initCapabilities();
        const formats = [AISummarizerFormat.PLAIN_TEXT, AISummarizerFormat.MARKDOWN];

        if ((capabilities as OldCapabilitiesApi).supportsFormat) {
            return formats.map((format) => {
                const result = (capabilities as OldCapabilitiesApi).supportsFormat(format);
                return `supportsFormat(${format}) = ${result}`
            });
        } else if ((capabilities as CapabilitiesApi).createOptionsAvailable) {
            return formats.map((format) => {
                const result = (capabilities as CapabilitiesApi).createOptionsAvailable({ format });
                return `createOptionsAvailable({ ${format} }) = ${result}`
            });
        }

        throw new Error('There is no method to determine whether the format is supported');
    }

    async checkSummarizerTypes(): Promise<string[]> {
        const capabilities = await this.initCapabilities(); 

        const types = [
            AISummarizerType.HEADLINE,
            AISummarizerType.KEYPOINTS,
            AISummarizerType.TEASER,
            AISummarizerType.TLDR
        ];
        if ((capabilities as OldCapabilitiesApi).supportsType) {
            return types.map((type) => {
                const typeStatus = (capabilities as OldCapabilitiesApi).supportsType(type);
                return `supportsType(${type}) = ${typeStatus}`;    
            });
        } else if ((capabilities as CapabilitiesApi).createOptionsAvailable) {
            return types.map((type) => {
                const typeStatus = (capabilities as CapabilitiesApi).createOptionsAvailable({ type });
                return `createOptionsAvailable({ ${type} }) = ${typeStatus}`;   
            });
        }

        throw new Error('There is no method to determine whether type is supported');
    }
    
    async checkSummarizerLengths(): Promise<string[]> {
        const capabilities = await this.initCapabilities();

        const lengths = [
            AISummarizerLength.LONG,
            AISummarizerLength.MEDIUM,
            AISummarizerLength.SHORT,
        ];
        if ((capabilities as OldCapabilitiesApi).supportsLength) {
            return lengths.map((length) => {
                const lengthStatus = (capabilities as OldCapabilitiesApi).supportsLength(length);
                return `supportsLength(${length}) = ${lengthStatus}`;    
            });
        } else if ((capabilities as CapabilitiesApi).createOptionsAvailable) {
            return lengths.map((length) => {
                const lengthStatus = (capabilities as CapabilitiesApi).createOptionsAvailable({ length });
                return `createOptionsAvailable({ ${length} }) = ${lengthStatus}`;    
            });
        }
        
        throw new Error('There is no method to determine whether the length is supported');
    }

    async languageAvailable(languageFlags: string[]): Promise<string[]> {
        const capabilities = await this.initCapabilities();

        const results = languageFlags.map((flag) => 
            `capabilities.languageAvailable(${flag}) = ${capabilities.languageAvailable(flag)}`);
        return results;
    }
    

    private initSession(options: AISummarizerCreateOptions) {
        if (!this.#summarizationApi) {
            throw new Error(`Your browser doesn't support the Summarization API. If you are on Chrome, join the Early Preview Program to enable it.`);
        } else if (!this.#summarizationApi.capabilities) {
            throw new Error('Capabilities detection is unsupported. Please check your configuration in chrome://flags/#optimization-guide-on-device-model');
        }

        return this.#summarizationApi.create(options);
    }

    async createSummarizer(options: AISummarizerCreateOptions, text: string) {
        const session = await this.initSession({ ...options, signal: this.#abortController.signal });
        
        const summary = await session.summarize(text);
        this.#summary.set(summary);
        session.destroy();
    }
}

import { inject, Injectable, signal } from '@angular/core';
import { AI_SUMMARIZATION_API_TOKEN } from '../constants/core.constant';
import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';
import { AISummarizerFormat, AISummarizerLength, AISummarizerType } from '../enums/capabilities-core-options.enum';
import { AISummarizerCreateOptions } from '../types/create-summarizer-options.type';
import { CapabilitiesApi, OldCapabilitiesApi } from '../types/summarizer-api-definition.type';
import { SummarizerSelectOptions } from '../types/summarizer-select-options.type';

const formats = [AISummarizerFormat.PLAIN_TEXT, AISummarizerFormat.MARKDOWN];
const types = [
    AISummarizerType.HEADLINE,
    AISummarizerType.KEYPOINTS,
    AISummarizerType.TEASER,
    AISummarizerType.TLDR
];
const lengths = [
    AISummarizerLength.LONG,
    AISummarizerLength.MEDIUM,
    AISummarizerLength.SHORT,
];

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

    async populateSelectOptions(): Promise<SummarizerSelectOptions> {

        const capabilities = await this.initCapabilities();
        const newCallOptions = this.populateCreateOptionValues(capabilities);
        if (newCallOptions) {
            return newCallOptions;
        }

        const oldCallOptions = this.populateSupportValues(capabilities);
        if (oldCallOptions) {
            return oldCallOptions;
        }

        throw new Error('There is no method to populate the select options');
    }

    private populateSupportValues(capabilities: OldCapabilitiesApi | CapabilitiesApi): 
        SummarizerSelectOptions | undefined {
        
        const result = {
            formatValues: [] as string[],
            lengthValues: [] as string[],
            typeValues: [] as string[],
        };

        if ((capabilities as OldCapabilitiesApi).supportsFormat && 
            (capabilities as OldCapabilitiesApi).supportsType &&
            (capabilities as OldCapabilitiesApi).supportsLength
        ) {
            const formatValues = formats.reduce((acc, format) => {
                const result = (capabilities as OldCapabilitiesApi).supportsFormat(format);
                return result === CAPABILITIES_AVAILABLE.READILY ? acc.concat(format) : acc;
            }, [] as string[]);

            const typeValues = types.reduce((acc, type) => {
                const typeStatus = (capabilities as OldCapabilitiesApi).supportsType(type);
                return typeStatus === CAPABILITIES_AVAILABLE.READILY ? acc.concat(type) : acc;
            }, [] as string[]);

            const lengthValues = lengths.reduce((acc, length) => {
                const lengthStatus = (capabilities as OldCapabilitiesApi).supportsLength(length);
                return lengthStatus === CAPABILITIES_AVAILABLE.READILY ? acc.concat(length) : acc;
            }, [] as string[]);

            return {
                formatValues,
                typeValues,
                lengthValues,
            };
        }

        return undefined;
    }

    private populateCreateOptionValues(capabilities: OldCapabilitiesApi | CapabilitiesApi) : 
        SummarizerSelectOptions | undefined {
        
        if ((capabilities as CapabilitiesApi).createOptionsAvailable) {
            const formatValues = formats.reduce((acc, format) => {
                const result = (capabilities as CapabilitiesApi).createOptionsAvailable({ format });
                return result === CAPABILITIES_AVAILABLE.READILY ? acc.concat(format) : acc;
            }, [] as string[]);

            const typeValues = types.reduce((acc, type) => {
                const typeStatus = (capabilities as CapabilitiesApi).createOptionsAvailable({ type });
                return typeStatus === CAPABILITIES_AVAILABLE.READILY ? acc.concat(type) : acc;
            }, [] as string[]);

            const lengthValues = lengths.reduce((acc, length) => {
                const lengthStatus = (capabilities as CapabilitiesApi).createOptionsAvailable({ length });
                return lengthStatus === CAPABILITIES_AVAILABLE.READILY ? acc.concat(length) : acc;
            }, [] as string[]);

            return {
                formatValues,
                lengthValues,
                typeValues,
            };
        }

        return undefined;
    }
}

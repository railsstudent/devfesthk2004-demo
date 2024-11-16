import { inject, Injectable, signal } from '@angular/core';
import { AI_SUMMARIZATION_API_TOKEN } from '../constants/core.constant';
import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';
import { AISummarizerFormat, AISummarizerLength, AISummarizerType } from '../enums/capabilities-core-options.enum';
import { isCapabilitiesApi } from '../guards/capabilities-api.guard';
import { isOldCapabilitiesApi } from '../guards/old-capabilities-api.guard';
import { AISummarizerCreateOptions } from '../types/create-summarizer-options.type';
import { UnionCapabilities } from '../types/summarizer-api-definition.type';
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
    #summaries = signal<string[]>([]);
    summaries = this.#summaries.asReadonly();

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

    async checkSummarizerFormats(): Promise<string[]> {
        const capabilities = await this.initCapabilities();

        if (isOldCapabilitiesApi(capabilities)) {
            return formats.map((format) => {
                const result = capabilities.supportsFormat(format);
                return `supportsFormat(${format}) = ${result}`
            });
        } else if (isCapabilitiesApi(capabilities)) {
            return formats.map((format) => {
                const result = capabilities.createOptionsAvailable({ format });
                return `createOptionsAvailable({ ${format} }) = ${result}`
            });
        }

        throw new Error('There is no method to determine whether the format is supported');
    }

    async checkSummarizerTypes(): Promise<string[]> {
        const capabilities = await this.initCapabilities(); 

        if (isOldCapabilitiesApi(capabilities)) {
            return types.map((type) => {
                const typeStatus = capabilities.supportsType(type);
                return `supportsType(${type}) = ${typeStatus}`;    
            });
        } else if (isCapabilitiesApi(capabilities)) {
            return types.map((type) => {
                const typeStatus = capabilities.createOptionsAvailable({ type });
                return `createOptionsAvailable({ ${type} }) = ${typeStatus}`;   
            });
        }

        throw new Error('There is no method to determine whether type is supported');
    }
    
    async checkSummarizerLengths(): Promise<string[]> {
        const capabilities = await this.initCapabilities();

        if (isOldCapabilitiesApi(capabilities)) {
            return lengths.map((length) => {
                const lengthStatus = capabilities.supportsLength(length);
                return `supportsLength(${length}) = ${lengthStatus}`;    
            });
        } else if (isCapabilitiesApi(capabilities)) {
            return lengths.map((length) => {
                const lengthStatus = capabilities.createOptionsAvailable({ length });
                return `createOptionsAvailable({ ${length} }) = ${lengthStatus}`;    
            });
        }
        
        throw new Error('There is no method to determine whether the length is supported');
    }

    async languageAvailable(languageFlags: string[]): Promise<string[]> {
        const capabilities = await this.initCapabilities();
        return languageFlags.map((flag) => 
            `capabilities.languageAvailable(${flag}) = ${capabilities.languageAvailable(flag)}`
        );
    }
    
    async summarize(options: AISummarizerCreateOptions, ...texts: string[]) {
        this.#summaries.set([]);
        const session = await this.initSession({ ...options, signal: this.#abortController.signal });
        
        const summaries: string[] = [];
        for (const text of texts) {
            const result = await session.summarize(text);
            summaries.push(result);
        }

        this.#summaries.set(summaries);
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

    private populateSupportValues(capabilities: UnionCapabilities): 
        SummarizerSelectOptions | undefined {
        
        if (isOldCapabilitiesApi(capabilities)) {
            const formatValues = formats.reduce((acc, format) => {
                const result = capabilities.supportsFormat(format);
                return result === CAPABILITIES_AVAILABLE.READILY ? acc.concat(format) : acc;
            }, [] as string[]);

            const typeValues = types.reduce((acc, type) => {
                const typeStatus = capabilities.supportsType(type);
                return typeStatus === CAPABILITIES_AVAILABLE.READILY ? acc.concat(type) : acc;
            }, [] as string[]);

            const lengthValues = lengths.reduce((acc, length) => {
                const lengthStatus = capabilities.supportsLength(length);
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

    private populateCreateOptionValues(capabilities: UnionCapabilities) : 
        SummarizerSelectOptions | undefined {
        
        if (isCapabilitiesApi(capabilities)) {
            const formatValues = formats.reduce((acc, format) => {
                const result = capabilities.createOptionsAvailable({ format });
                return result === CAPABILITIES_AVAILABLE.READILY ? acc.concat(format) : acc;
            }, [] as string[]);

            const typeValues = types.reduce((acc, type) => {
                const typeStatus = capabilities.createOptionsAvailable({ type });
                return typeStatus === CAPABILITIES_AVAILABLE.READILY ? acc.concat(type) : acc;
            }, [] as string[]);

            const lengthValues = lengths.reduce((acc, length) => {
                const lengthStatus = capabilities.createOptionsAvailable({ length });
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

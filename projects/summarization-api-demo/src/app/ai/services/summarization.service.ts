import { inject, Injectable, signal } from '@angular/core';
import { AI_SUMMARIZATION_API_TOKEN } from '../constants/core.constant';
import { SummarizerSelectOptions } from '../types/summarizer-select-options.type';

const formats: AISummarizerFormat[] = ['plain-text', 'markdown'];
const types: AISummarizerType[] = ['headline', 'key-points', 'teaser', 'tl;dr'];
const lengths: AISummarizerLength[] = ['long', 'medium', 'short'];

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
        return this.validateAndReturnApi().capabilities();
    }

    async checkSummarizerFormats(): Promise<string[]> {
        const capabilities = await this.initCapabilities();

        return formats.map((format) => {
            const result = capabilities.supportsFormat(format);
            return `supportsFormat(${format}) = ${result}`
        });
    }

    async checkSummarizerTypes(): Promise<string[]> {
        const capabilities = await this.initCapabilities(); 

        return types.map((type) => {
            const typeStatus = capabilities.supportsType(type);
            return `supportsType(${type}) = ${typeStatus}`;    
        });
    }
    
    async checkSummarizerLengths(): Promise<string[]> {
        const capabilities = await this.initCapabilities();

        return lengths.map((length) => {
            const lengthStatus = capabilities.supportsLength(length);
            return `supportsLength(${length}) = ${lengthStatus}`;    
        });
    }

    async languageAvailable(languageFlags: string[]): Promise<string[]> {
        const capabilities = await this.initCapabilities();
        return languageFlags.map((flag) => 
            `capabilities.languageAvailable(${flag}) = ${capabilities.languageAvailable(flag)}`
        );
    }

    private async createOptionsAvalable({ format, type, length }: AISummarizerCreateOptions): Promise<boolean> {
        const capabilities = await this.initCapabilities();
        return (!format || capabilities.supportsFormat(format) === 'readily') &&
            (!type || capabilities.supportsType(type) === 'readily') &&
            (!length || capabilities.supportsLength(length) === 'readily');
    }
    
    async summarize(options: AISummarizerCreateOptions, ...texts: string[]) {
        this.#summaries.set([]);

        const session = await this.validateAndReturnApi().create({ ...options, 
            signal: this.#abortController.signal })
        
        const isAvailable = await this.createOptionsAvalable(options);
        if (!isAvailable) {
            return;
        }
        
        const summarizedTexts: string[] = [];
        for (const text of texts) {
            summarizedTexts.push(await session.summarize(text));
        }

        this.#summaries.set(summarizedTexts);
        session.destroy();
    }

    async populateSelectOptions(): Promise<SummarizerSelectOptions> {
        const capabilities = await this.initCapabilities();

        const oldCallOptions = this.populateSupportValues(capabilities);
        if (oldCallOptions) {
            return oldCallOptions;
        }

        throw new Error('There is no method to populate the select options');
    }
    
    private populateSupportValues(capabilities: AISummarizerCapabilities): 
        SummarizerSelectOptions | undefined {
        
        const formatValues = formats.reduce((acc, format) => {
            const result = capabilities.supportsFormat(format);
            return result === 'readily' ? acc.concat(format) : acc;
        }, [] as AISummarizerFormat[]);

        const typeValues = types.reduce((acc, type) => {
            const typeStatus = capabilities.supportsType(type);
            return typeStatus === 'readily' ? acc.concat(type) : acc;
        }, [] as AISummarizerType[]);

        const lengthValues = lengths.reduce((acc, length) => {
            const lengthStatus = capabilities.supportsLength(length);
            return lengthStatus === 'readily' ? acc.concat(length) : acc;
        }, [] as AISummarizerLength[]);

        return {
            formatValues,
            typeValues,
            lengthValues,
        };
    }
}

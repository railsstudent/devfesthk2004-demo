import { inject, Injectable } from '@angular/core';
import { AI_SUMMARIZATION_API_TOKEN } from '../constants/core.constant';
import { AISummarizerFormat, AISummarizerLength, AISummarizerType } from '../enums/capabilities-core-options.enum';
import { CapabilitiesApi, OldCapabilitiesApi } from '../types/summarizer-api-definition.type';

@Injectable({
    providedIn: 'root'    
})
export class SummarizationService {
    #summarizationApi = inject(AI_SUMMARIZATION_API_TOKEN);
    abortSignal = new AbortController().signal;

    private initCapabilities() {
        if (!this.#summarizationApi) {
            throw new Error(`Your browser doesn't support the Summarization API. If you are on Chrome, join the Early Preview Program to enable it.`);
        } else if (!this.#summarizationApi.capabilities) {
            throw new Error('Capabilities detection is unsupported. Please check your configuration in chrome://flags/#optimization-guide-on-device-model');
        }

        return this.#summarizationApi.capabilities();
    }

    async checkSummarizerFormat(format: AISummarizerFormat): Promise<string> {
        const capabilities = await this.initCapabilities();
        if ((capabilities as OldCapabilitiesApi).supportsFormat) {
            const formatStatus = (capabilities as OldCapabilitiesApi).supportsFormat(format);
            return `supportsFormat(${format}) = ${formatStatus}`;
        } else if ((capabilities as CapabilitiesApi).createOptionsAvailable) {
            const formatStatus = (capabilities as CapabilitiesApi).createOptionsAvailable({ format });
            return `createOptionsAvailable({ ${format} }) = ${formatStatus}`;
        }

        throw new Error('There is no method to determine whether the format is supported');
    }

    async checkSummarizerType(type: AISummarizerType): Promise<string> {
        const capabilities = await this.initCapabilities(); 
        if ((capabilities as OldCapabilitiesApi).supportsType) {
            const typeStatus = (capabilities as OldCapabilitiesApi).supportsType(type);
            return `supportsType(${type}) = ${typeStatus}`;
        } else if ((capabilities as CapabilitiesApi).createOptionsAvailable) {
            const typeStatus = (capabilities as CapabilitiesApi).createOptionsAvailable({ type });
            return `createOptionsAvailable({ ${type} }) = ${typeStatus}`;
        }

        throw new Error('There is no method to determine whether type is supported');
    }
    
    async checkSummarizerLength(length: AISummarizerLength): Promise<string> {
        const capabilities = await this.initCapabilities();
        if ((capabilities as OldCapabilitiesApi).supportsLength) {
            const lengthStatus = (capabilities as OldCapabilitiesApi).supportsLength(length);
            return `supportsLength(${length}) = ${lengthStatus}`;
        } else if ((capabilities as CapabilitiesApi).createOptionsAvailable) {
            const lengthStatus = (capabilities as CapabilitiesApi).createOptionsAvailable({ length });
            return `createOptionsAvailable({ ${length} }) = ${lengthStatus}`;
        }
        
        throw new Error('There is no method to determine whether the length is supported');
    }

    async languageAvailable(languageFlags: string[]): Promise<string[]> {
        const capabilities = await this.initCapabilities();

        const results = languageFlags.map((flag) => 
            `capabilities.languageAvailable(${flag}) = ${capabilities.languageAvailable(flag)}`);
        return results;
    }
    

    // resetSession(newSession: any) {
    //     this.#session.set(newSession);
    // }

    // async prompt(query: string): Promise<string> {
    //     if (!this.summarizationApi) {
    //     throw new Error(`Your browser doesn't support the Prompt API. If you are on Chrome, join the Early Preview Program to enable it.`);
    //     }

    //     const session = this.session();
    //     if (!session) {
    //         throw new Error('Failed to create AITextSession.');
    //     }

    //     const answer = await session.prompt(query);
    //     return answer;
    // }

    // countNumTokens(query: string): Promise<number> {
    //     if (!this.#session) {
    //         return Promise.resolve(0);
    //     }

    //     const session = this.#session();
    //     return session.countPromptTokens(query) as Promise<number>;
    // }

    // destroySession() {
    //     const session = this.session();

    //     if (session) {
    //         session.destroy();
    //         console.log('Destroy the prompt session.');
    //         this.resetSession(null);
    //     }
    // }
}

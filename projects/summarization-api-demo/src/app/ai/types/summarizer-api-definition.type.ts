import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';
import { AISummarizerFormat, AISummarizerLength, AISummarizerType } from '../enums/capabilities-core-options.enum';
import { AISummarizerCreateCoreOptions, AISummarizerCreateOptions } from './create-summarizer-options.type';

export interface OldCapabilitiesApi {
    available: CAPABILITIES_AVAILABLE
    supportsFormat: (input: AISummarizerFormat) => CAPABILITIES_AVAILABLE,
    supportsLength: (input: AISummarizerLength) => CAPABILITIES_AVAILABLE,
    supportsType: (input: AISummarizerType) => CAPABILITIES_AVAILABLE,
    languageAvailable: (languageFlag: string) => CAPABILITIES_AVAILABLE,
}

export interface CapabilitiesApi {
    available: CAPABILITIES_AVAILABLE,
    createOptionsAvailable: (options: AISummarizerCreateCoreOptions) => CAPABILITIES_AVAILABLE,
    languageAvailable: (languageFlag: string) => CAPABILITIES_AVAILABLE,
}

export interface AISummarizerApi { 
    create: (options?: AISummarizerCreateOptions) => Promise<{ 
        summarize(str: string): Promise<string>,
        format: AISummarizerFormat,
        type: AISummarizerType,
        length: AISummarizerLength,
        sharedContext: string
        destroy(): void
    }>, 
    capabilities: () =>  Promise<OldCapabilitiesApi | CapabilitiesApi>,
}

export type SummarizerApiDefinition = AISummarizerApi | undefined;

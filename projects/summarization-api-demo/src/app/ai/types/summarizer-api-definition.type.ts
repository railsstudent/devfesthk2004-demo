import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';
import { AISummarizerFormat, AISummarizerLength, AISummarizerType } from '../enums/capabilities-core-options.enum';
import { AISummarizerCreateCoreOptions, AISummarizerCreateOptions } from './create-summarizer-options.type';

interface CommonCapability {
    available: CAPABILITIES_AVAILABLE
    languageAvailable: (languageFlag: string) => CAPABILITIES_AVAILABLE,
}

export interface OldCapabilitiesApi extends CommonCapability {
    supportsFormat: (input: AISummarizerFormat) => CAPABILITIES_AVAILABLE,
    supportsLength: (input: AISummarizerLength) => CAPABILITIES_AVAILABLE,
    supportsType: (input: AISummarizerType) => CAPABILITIES_AVAILABLE,
}

export interface CapabilitiesApi extends CommonCapability {
    createOptionsAvailable: (options: AISummarizerCreateCoreOptions) => CAPABILITIES_AVAILABLE,
}

export type UnionCapabilities = OldCapabilitiesApi | CapabilitiesApi;

export interface AISummarizerApi { 
    create: (options?: AISummarizerCreateOptions) => Promise<{ 
        summarize(str: string): Promise<string>,
        format: AISummarizerFormat,
        type: AISummarizerType,
        length: AISummarizerLength,
        sharedContext: string
        destroy(): void
    }>, 
    capabilities: () =>  Promise<UnionCapabilities>,
}

export type SummarizerApiDefinition = AISummarizerApi | undefined;

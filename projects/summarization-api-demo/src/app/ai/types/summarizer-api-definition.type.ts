import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';
import { AISummarizerCreateCoreOptions, AISummarizerCreateOptions } from './create-summarizer-options.type';

interface OldCapabilitiesApi {
    available: CAPABILITIES_AVAILABLE
    supportsFormat: (input: string) => CAPABILITIES_AVAILABLE,
    supportsLength: (input: string) => CAPABILITIES_AVAILABLE,
    supportsType: (input: string) => CAPABILITIES_AVAILABLE,
    languageAvailable: (languageFlag: string) => CAPABILITIES_AVAILABLE,
}

interface CapabilitiesApi {
    available: CAPABILITIES_AVAILABLE,
    createOptionsAvailable: (options: AISummarizerCreateCoreOptions) => CAPABILITIES_AVAILABLE,
    languageAvailable: (languageFlag: string) => CAPABILITIES_AVAILABLE,
}

export interface AISummarizerApi { 
    create: (options?: AISummarizerCreateOptions) => any, 
    capabilities: () =>  OldCapabilitiesApi | CapabilitiesApi,
}

export type SummarizerApiDefinition = AISummarizerApi | undefined;

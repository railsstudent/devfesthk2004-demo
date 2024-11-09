import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum';

export type LanguagePairAvailable = {
    sourceLanguage: string;
    targetLanguage: string;
    available: CAPABILITIES_AVAILABLE;
}

export type LanguagePair = Omit<LanguagePairAvailable, 'available'>;

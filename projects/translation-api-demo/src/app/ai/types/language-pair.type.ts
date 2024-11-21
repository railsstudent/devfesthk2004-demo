export type LanguagePairAvailable = {
    sourceLanguage: string;
    targetLanguage: string;
    available: AICapabilityAvailability;
}

export type LanguagePair = Omit<LanguagePairAvailable, 'available'>;

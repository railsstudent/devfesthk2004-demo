export type LanguagePairAvailable = {
    sourceLanguage: string;
    targetLanguage: string;
    available: Availability;
}

export type LanguagePair = Omit<LanguagePairAvailable, 'available'>;

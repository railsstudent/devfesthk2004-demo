export type LanguageDetectionResult = {
    confidence: number;
    detectedLanguage: string;
}

export type LanguageDetectionWithNameResult = LanguageDetectionResult & {
    name: string;
}

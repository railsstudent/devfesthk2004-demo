export type TranslatedFeedbackWithSentiment = {
    code: string;
    translatedText: string;
    targetCode: string;
    sentiment: string;
}

export type TranslationInput = Omit<TranslatedFeedbackWithSentiment, 'targetCode'>;

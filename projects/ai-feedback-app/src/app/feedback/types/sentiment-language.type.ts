export type TranslatedFeedback = {
    code: string;
    language: string 
    translatedText: string;
    targetCode: string;
};

export type TranslatedFeedbackWithSentiment = Omit<TranslatedFeedback, 'language'> & {
    sentiment: string;
}

export type TranslationInput = Omit<TranslatedFeedbackWithSentiment, 'targetCode'>;

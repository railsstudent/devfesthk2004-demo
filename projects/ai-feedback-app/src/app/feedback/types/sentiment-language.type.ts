export type SentimentLanguage = { 
    sentiment: string;
    code: string;
    language: string 
};

export type TranslatedFeedback = Pick<SentimentLanguage, 'code' | 'language'> & {
    translatedText: string;
    targetCode: string;
};

export type TranslatedFeedbackWithSentiment = SentimentLanguage & TranslatedFeedback;

export type TranslatedFeedbackWithPair = Omit<TranslatedFeedbackWithSentiment, 'language'>;

export type SentimentLanguage = { 
    sentiment: string;
    code: string;
    language: string 
};

export type TranslatedFeedback = Pick<SentimentLanguage, 'code' | 'language'> & {
    text: string 
};

export type TranslatedFeedbackWithSentiment = SentimentLanguage & TranslatedFeedback

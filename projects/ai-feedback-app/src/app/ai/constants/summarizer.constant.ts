export const SUMMARIZER_SHARED_CONTEXT = `You are an expert that can summarize a customer's feedback. 
If the text is not in English, please return a blank string.`;

export const SUMMARIZER_AVAILABILITY_OPTIONS: SummarizerCreateCoreOptions = {
    type: 'headline',
    format: 'plain-text',
    length: 'medium',
    expectedInputLanguages: ['en'],
    expectedContextLanguages: ['en'],
    outputLanguage: 'en',
};

export const SUMMARIZER_OPTIONS: SummarizerCreateOptions = {
    ...SUMMARIZER_AVAILABILITY_OPTIONS,
    sharedContext: SUMMARIZER_SHARED_CONTEXT,
};

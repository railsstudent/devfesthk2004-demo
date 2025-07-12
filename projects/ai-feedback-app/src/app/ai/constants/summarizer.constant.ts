export const SUMMARIZER_SHARED_CONTEXT = "You are an expert that can summarize a customer's feedback.";

export const SUMMARIZER_AVAILABILITY_OPTIONS: SummarizerCreateCoreOptions = {
    type: 'tldr',
    format: 'plain-text',
    length: 'short',
    expectedInputLanguages: ['en'],
    expectedContextLanguages: ['en'],
    outputLanguage: 'en',
};

export const SUMMARIZER_OPTIONS: SummarizerCreateOptions = {
    ...SUMMARIZER_AVAILABILITY_OPTIONS,
    sharedContext: SUMMARIZER_SHARED_CONTEXT,
};

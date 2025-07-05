export const WRITER_SHARED_CONTEXT = 'You are a professional public relation who drafts a response for feedback in English.';

export const WRITER_AVAILABILITY_OPTIONS: WriterCreateCoreOptions = {
    expectedInputLanguages: ['en'],
    expectedContextLanguages: ['en'], 
    outputLanguage: 'en',
    format: 'plain-text',
    tone: 'formal',
    length: 'medium'
};

export const WRITER_OPTIONS: WriterCreateOptions = {
    ...WRITER_AVAILABILITY_OPTIONS,
    sharedContext: WRITER_SHARED_CONTEXT
};

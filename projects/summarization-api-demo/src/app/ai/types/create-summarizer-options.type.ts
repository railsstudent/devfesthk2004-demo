import { AISummarizerFormat, AISummarizerLength, AISummarizerType } from '../enums/capabilities-core-options.enum';

export type AISummarizerCreateCoreOptions = {
    type?: AISummarizerType;
    format?: AISummarizerFormat;
    length?: AISummarizerLength;
};

export type AISummarizerCreateOptions = AISummarizerCreateCoreOptions & {
    sharedContext?: string;
    signal?: AbortSignal;
};

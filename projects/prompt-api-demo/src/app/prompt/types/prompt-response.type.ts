import { ChunkType } from '../../ai/types/chunk.type';
import { Tokenization } from '../../ai/types/prompt.type';

export type State = {
    status: string;
    text: string;
    disabled: boolean;
    numTokensDisabled: boolean;
    submitDisabled: boolean;
}

export type PromptResponse = State & {
    numPromptTokens: number;
    tokenContext: Tokenization | null;
    error: string;
    chunk: ChunkType;
}

export type ParseStreamedResponse = { 
    chunk: string; 
    chunks: string; 
    sequence?: number; 
    done: boolean;
}

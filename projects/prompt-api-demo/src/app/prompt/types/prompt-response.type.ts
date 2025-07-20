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
    value?: string; 
}

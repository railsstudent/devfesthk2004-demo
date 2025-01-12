import { Tokenization } from '../../ai/types/prompt.type';

export type PromptResponse = {
    status: string;
    text: string;
    disabled: boolean,
    numTokensDisabled: boolean,
    submitDisabled: boolean,
    numPromptTokens: number;
    tokenContext: Tokenization | null;
    error: string;
    response: string;
}

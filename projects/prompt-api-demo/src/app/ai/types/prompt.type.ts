export type LanguageInitialPrompt = [LanguageModelSystemMessage, ...LanguageModelMessage[]] 
    | LanguageModelMessage[];
    
export type Tokenization = {
    tokensSoFar: number;
    maxTokens: number;
    tokensLeft: number;
};

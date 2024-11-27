export type Tokenization = Pick<AILanguageModel, "tokensSoFar" | "tokensLeft" | "maxTokens">;

export type LanguageInitialPrompt = 
    [AILanguageModelSystemPrompt, ...AILanguageModelPrompt[]]
    | AILanguageModelPrompt[];

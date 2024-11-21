export type Tokenization = Pick<AILanguageModel, "tokensSoFar" | "tokensLeft" | "maxTokens">;

export type LanguageInitialPrompt = 
    [AILanguageModelSystemPrompt, ...Array<AILanguageModelAssistantPrompt | AILanguageModelUserPrompt>]
    | Array<AILanguageModelAssistantPrompt | AILanguageModelUserPrompt>;

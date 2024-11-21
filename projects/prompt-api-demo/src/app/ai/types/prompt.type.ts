export type Tokenization = Pick<AILanguageModel, "tokensSoFar" | "tokensLeft" | "maxTokens">;

export type SessionConfiguration = Pick<AILanguageModel, "temperature" | "topK">;

export type LanguageInitialPrompt = 
    [AILanguageModelSystemPrompt, ...Array<AILanguageModelAssistantPrompt | AILanguageModelUserPrompt>]
    | Array<AILanguageModelAssistantPrompt | AILanguageModelUserPrompt>;

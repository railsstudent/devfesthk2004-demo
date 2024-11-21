export type LanguageInitialPrompt =     
    [AILanguageModelSystemPrompt, ...Array<AILanguageModelAssistantPrompt | AILanguageModelUserPrompt>]
    | Array<AILanguageModelAssistantPrompt | AILanguageModelUserPrompt>;

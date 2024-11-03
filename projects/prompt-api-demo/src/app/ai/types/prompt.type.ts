export type CustomPrompt = {
    query: string;
    systemPrompt?: string;
    initialPrompts?: {
        role: 'system' | 'user' | 'assistant';
        content: string;
    }[];
}

// maxToken,
// temperature,
// tokensLeft,
// tokensSoFar
// topK
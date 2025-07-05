export const PROMPT_OPTIONS: LanguageModelCreateOptions = {
    initialPrompts: [
        { role: 'system', content: `You are an expert in determine the sentiment of a text. 
        If it is positive, say 'positive'. If it is negative, say 'negative'. If you are not sure, then say 'not sure'` },
        { role: 'user', content: "The food is affordable and delicious, and the venue is close to the train station." },
        { role: 'assistant', content: "positive" },
        { role: 'user', content: "The waiters are very rude, the food is salty, and the drinks are sour." },
        { role: 'assistant', content: "negative" },
        { role: 'user', content: "The weather is hot and sunny today." },
        { role: 'assistant', content: "postive" }
    ],
    expectedInputs: [
        {
            type: 'text',
            languages: ['en']
        }
    ],
    expectedOutputs: [
        {
            type: 'text',
            languages: ['en']
        }
    ]
}
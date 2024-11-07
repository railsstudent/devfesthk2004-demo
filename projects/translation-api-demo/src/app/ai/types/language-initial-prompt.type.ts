import { AILanguageModelInitialPromptRole } from '../enums/initial-prompt-role.enum';

export type LanguageInitialPrompt = { 
    role: AILanguageModelInitialPromptRole;
    content: string 
}

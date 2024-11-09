import { LanguageModelCapabilities } from './language-model-capabilties.type';

export type CanTranslateStatus = { 
    targetLanguage: string; 
    status: LanguageModelCapabilities;
}

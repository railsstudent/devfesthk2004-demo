export interface TranslationApiDefinition { 
    canDetect: (...args: unknown[]) => Promise<AICapabilityAvailability>, 
    canTranslate: (...args: unknown[]) => Promise<AICapabilityAvailability>,
    createDetector: Function,
    createTranslator: Function,
}

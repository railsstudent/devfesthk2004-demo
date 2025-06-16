export enum ERROR_CODES {
    NO_SUMMARIZATION_API = 'Summarization API is not available, check your configuration in chrome://flags/#summarization-api-for-gemini-nano',
    API_NOT_READY = 'Build-in Prompt API not found in window. Please check the Prompt API\'s explainer in github.com/explainers-by-googlers/prompt-api',
    AFTER_DOWNLOAD = 'Built-in AI is not ready, please go to chrome://components and start downloading the Optimization Guide On Device Model',
    NO_LLM_MODEL = 'The model of the Summarization API is not available',
}

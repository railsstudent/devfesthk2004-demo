export enum ERROR_CODES {
    NOT_CHROME_BROWSER = 'Your browser is not supported. Please use Google Chrome Dev or Canary.',
    OLD_BROWSER = 'Please upgrade the Chrome version to at least 131.',
    NO_PROMPT_API = 'Prompt API is not available, check your configuration in chrome://flags/#prompt-api-for-gemini-nano',
    API_NOT_READY = 'Build-in Prompt API not found in window. Please check the Prompt API\'s explainer in github.com/explainers-by-googlers/prompt-api',
    AFTER_DOWNLOAD = 'Built-in AI is not ready, please go to chrome://components and start downloading the Optimization Guide On Device Model',
    NO_LARGE_LANGUAGE_MODEL = 'The model of the Prompt API is not implemented. Please check your configuration in chrome://flags/#optimization-guide-on-device-model'
}

 
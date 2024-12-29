export enum ERROR_CODES {
    UNSUPPORTED_BROWSER = 'Your browser is not supported. Please use Google Chrome Dev or Canary.',
    OLD_BROSWER = `Please upgrade the Chrome version to at least 129.`,
    NO_API = 'Language Detection API is not available, check your configuration in chrome://flags/#language-detection-api',
    AFTER_DOWNLOAD = 'Built-in AI is not ready, please go to chrome://components and start downloading the Optimization Guide On Device Model',
    NO_GEMINI_NANO = `The model of Language Detection API is not implemented. Please check your configuration in chrome://flags/#optimization-guide-on-device-model`
}
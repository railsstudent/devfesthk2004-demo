export enum ERROR_CODES {
    NO_TRANSLATOR = 'The Translator is not created. Please check the Translation API\'s explainer',
    TRANSLATION_AFTER_DOWNLLOAD = 'Built-in AI is not ready, please go to chrome://components and start downloading the Chrome TranslateKit.',
    NO_TRANSLATION_API = 'The Translation API is not enabled. Please check your configuration in chrome://flags/#translation-api',
    NO_LANGUAGE_DETECTOR_API = 'The Language Detector API is not supported. Please check your configuration in chrome://flags/#language-detection-api',
    NO_LANGUAGE_DETECTOR = 'The Language Detector is not created. Please check the Language Detector API\'s explainer',
 }
 
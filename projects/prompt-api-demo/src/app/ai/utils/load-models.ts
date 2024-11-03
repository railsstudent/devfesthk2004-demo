import config from '~assets/config.json';
import { TextClassifier, FilesetResolver, LanguageDetector } from "@mediapipe/tasks-text";

const createTextTasks = () => FilesetResolver.forTextTasks(config.taskTextUrl);

export async function createTextClassifier(): Promise<TextClassifier> {
    const text = await createTextTasks();
    return TextClassifier.createFromOptions(text, {
      baseOptions: {
        modelAssetPath: config.textClassifier.path
      },
      maxResults: config.textClassifier.maxResults,
    });
}

export async function createLanguageDetector(): Promise<LanguageDetector> {
  const text = await createTextTasks();
  return LanguageDetector.createFromOptions(text, {
    baseOptions: {
      modelAssetPath: config.languageDetector.path,
    },
    maxResults: config.languageDetector.maxResults,
  });
}

import { LanguagePair } from '../../ai/types/language-pair.type';

export type StreamTranslation = {
    languagePair: LanguagePair;
    inputText: string;
}

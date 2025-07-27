import { LanguagePairAvailable } from '../../ai/types/language-pair.type';

export type ViewModel = {
    usage: number;
    sample: {
        sourceLanguage: string;
        inputText: string;
    };
    languagePairs: LanguagePairAvailable[];
    strError:  string;
    downloadPercentage: number;
}

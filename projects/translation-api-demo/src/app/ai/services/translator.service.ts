import { Injectable } from '@angular/core';
import { EXPECTED_TRANSLATOR_LANGUAGES } from '../constants/expected-languages.constant';
import { LanguagePair, LanguagePairAvailable } from '../types/language-pair.type';
import { isTranslatorAPISupported } from '../utils/ai-detection';

@Injectable({
  providedIn: 'root'
})
export class TranslatorService  {
    #controller = new AbortController();

    private async isCreateMonitorCallbackNeeded(languagePair: LanguagePair) {
        const availability = await Translator.availability(languagePair);

        return ['downloadable', 'downloading'].includes(availability);
    }

    async createLanguagePairs(sourceLanguage: string): Promise<LanguagePairAvailable[]> {
        await isTranslatorAPISupported()

        const results: LanguagePairAvailable[] = [];
        for (const targetLanguage of EXPECTED_TRANSLATOR_LANGUAGES) {
            if (sourceLanguage !== targetLanguage) {
                const available = await Translator.availability({ sourceLanguage, targetLanguage });
                if (available !== 'unavailable') {
                    results.push({ sourceLanguage, targetLanguage, available });
                }
            }
        }
        return results;
    }

    private async createTranslator(languagePair: LanguagePair): Promise<Translator> {
        await isTranslatorAPISupported();

        const monitor = (await this.isCreateMonitorCallbackNeeded(languagePair)) ? 
            (m: CreateMonitor) => m.addEventListener("downloadprogress", (e) => 
                console.log(`Translator: Downloaded ${Math.floor(e.loaded * 100)}%`)
            ) : undefined;

        return Translator.create({
            ...languagePair,
            signal: this.#controller.signal,
            monitor,
        }) 
    }

    async translate(languagePair: LanguagePair, inputText: string): Promise<string> {
        try { 
            const translator = await this.createTranslator(languagePair);
            if (!translator) {
                return '';
            }

            const translatedText = await translator.translate(inputText, 
                { signal: this.#controller.signal});            
            translator.destroy();

            return translatedText;
        } catch (e) {
            if (e instanceof DOMException && e.name === 'InvalidStateError') {
                console.error('The document is not active. Please try again later.');
            } else if (e instanceof DOMException && e.name === 'NetworkError') {
                console.error('The network is not available to download the AI model.');
            } else if (e instanceof DOMException && e.name === 'NotAllowedError') {
                console.error('The Translator is not allowed to create. Language pair:', languagePair);
            } else if (e instanceof DOMException && e.name === 'NotSupportedError') {
                console.error('The Translator does not support one of the languages. Language pair:', languagePair);
            } else if (e instanceof DOMException && e.name === 'OperationError') {
                console.error('Operation error occurred when creating the translator for the language pair:', languagePair);
            } else if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                console.error('Translator API Quota exceeded. Please try again later.');
            } else if (e instanceof Error) {
                console.error(e.message);
            } else {
                console.error(e);
            }
            return '';
        }
    }

    async downloadLanguagePackage(languagePair: LanguagePair): Promise<LanguagePairAvailable> {
        try { 
            const translator = await this.createTranslator(languagePair);
            translator.destroy();

            const available = await Translator.availability(languagePair)
            return { ...languagePair, available };
        } catch (e) {
            if (e instanceof DOMException && e.name === 'InvalidStateError') {
                console.error('The document is not active. Please try again later.');
            } else if (e instanceof DOMException && e.name === 'NetworkError') {
                console.error('The network is not available to download the model.');
            } else if (e instanceof DOMException && e.name === 'NotAllowedError') {
                console.error('Translator is not allowed to create. Language pair:', languagePair);
            } else if (e instanceof DOMException && e.name === 'NotSupportedError') {
                console.error('Translator does not support one of the languages. Language pair:', languagePair);
            } else if (e instanceof DOMException && e.name === 'OperationError') {
                console.error('Operation error occurred when creating a translator for language pair:', languagePair);
            } else if (e instanceof Error) {
                console.error(e.message);
            } else {
                console.error(e);
            }

            return { ...languagePair, available: 'unavailable'}
        }
    }

}

import { Injectable, signal } from '@angular/core';
import { EXPECTED_TRANSLATOR_LANGUAGES } from '../constants/expected-languages.constant';
import { LanguagePair, LanguagePairAvailable } from '../types/language-pair.type';
import { isTranslatorAPISupported } from '../utils/ai-detection';

@Injectable({
  providedIn: 'root'
})
export class TranslatorService  {
    #controller = new AbortController();
    strError = signal('');

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

    private handleErrors(e: unknown, languagePair: LanguagePair) {
        if (e instanceof DOMException && e.name === 'InvalidStateError') {
            const invalidStateError ='The document is not active. Please try again later.';
            console.error(invalidStateError);
            this.strError.set(invalidStateError);
        } else if (e instanceof DOMException && e.name === 'NetworkError') {
            const networkError = 'The network is not available to download the AI model.';
            console.error(networkError);
            this.strError.set(networkError);
        } else if (e instanceof DOMException && e.name === 'NotAllowedError') {
            const unallowedError = 'The Translator is not allowed to create.';
            console.error(unallowedError, languagePair);
            this.strError.set(unallowedError);
        } else if (e instanceof DOMException && e.name === 'NotSupportedError') {
            const unsupportedError = 'The Translator does not support one of the languages.';
            const unallowedError = 'The Translator is not allowed to create.';
            console.error(unallowedError, languagePair);
            this.strError.set(unallowedError);
        } else if (e instanceof DOMException && e.name === 'OperationError') {
            const operationError = 'Operation error occurred when creating the translator for the language pair:';
            console.error(operationError, languagePair);
            this.strError.set(operationError);

        } else if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            const quotaError = 'Translator API Quota exceeded. Please try again later.';
            console.error(quotaError);
            this.strError.set(quotaError);
        } else if (e instanceof Error) {
            console.error(e.message);
            this.strError.set(e.message);
        } else {
            console.error(e);
            this.strError.set('Unknow error occurred while using the translator.');
        }
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
            this.handleErrors(e, languagePair);
            return '';
        }
    }

    async downloadLanguagePackage(languagePair: LanguagePair): Promise<LanguagePairAvailable> {
        try { 
            const translator = await this.createTranslator(languagePair);
            if (!translator) {
                return { ...languagePair, available: 'unavailable'};
            }
            translator.destroy();

            const available = await Translator.availability(languagePair);
            return { ...languagePair, available };
        } catch (e) {
            this.handleErrors(e, languagePair);
            return { ...languagePair, available: 'unavailable'};
        }
    }

}

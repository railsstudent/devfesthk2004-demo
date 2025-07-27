import { Injectable, signal } from '@angular/core';
import { EXPECTED_TRANSLATOR_LANGUAGES } from '../constants/translator-languages.constant';
import { LanguagePair, LanguagePairAvailable } from '../types/language-pair.type';
import { isTranslatorAPISupported } from '../utils/ai-detection';

@Injectable({
  providedIn: 'root'
})
export class TranslatorService  {
    #controller = new AbortController();
    strError = signal('');

    #downloadPercentage = signal(100);
    downloadPercentage = this.#downloadPercentage.asReadonly();

    #usage = signal(0);
    usage = this.#usage.asReadonly();

    private readonly errors: Record<string, string> = {
        'InvalidStateError': 'The document is not active. Please try again later.',
        'NetworkError': 'The network is not available to download the AI model.',
        'NotAllowedError': 'The Translator is not allowed to create.',
        'NotSupportedError': 'The Translator does not support one of the languages.',
        'OperationError': 'Operation error occurred when creating the translator for the language pair:',
        'QuotaExceededError': 'Translator API Quota exceeded. Please try again later.',
        'UnknownError': 'Unknown error occurred while using the translator.',
    }

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

        this.#downloadPercentage.set(0);
        const requireMonitor = await this.isCreateMonitorCallbackNeeded(languagePair);
        if (!requireMonitor) {
            this.#downloadPercentage.set(100);            
        }

        const monitor = requireMonitor ? 
            (m: CreateMonitor) => m.addEventListener("downloadprogress", (e) => {
                const percentage = Math.floor(e.loaded * 100);
                console.log(`Translator: Downloaded ${percentage}%`);
                this.#downloadPercentage.set(percentage);
            }) : undefined;

        return Translator.create({
            ...languagePair,
            signal: this.#controller.signal,
            monitor,
        }) 
    }

    private handleErrors(e: unknown, languagePair: LanguagePair) {
        if (e instanceof DOMException) {
            const error = this.errors[e.name];
            if (error) {
                console.error(error, languagePair);
                this.strError.set(error);
            }
        } else if (e instanceof Error && e.message) {
            console.error(e.message);
            this.strError.set(e.message);
        } else {
            console.error(e);
            this.strError.set(this.errors['UnknownError']);
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

    async translateStream(languagePair: LanguagePair, inputText: string): Promise<string> {
        try { 
            const translator = await this.createTranslator(languagePair);
            if (!translator) {
                return '';
            }

            const usage = translator.measureInputUsage(inputText);
            const stream = translator.translateStreaming(inputText, {
                signal: this.#controller.signal
            });

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

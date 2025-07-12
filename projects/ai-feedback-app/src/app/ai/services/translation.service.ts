import { Injectable, OnDestroy, signal } from '@angular/core';
import { LanguagePair } from '../types/language-pair.type';
import { TranslatedFeedbackChunk } from '../types/translation.type';

@Injectable({
  providedIn: 'root'
})
export class TranslationService implements OnDestroy  {
    #constroller = new AbortController();
    #chunk = signal<TranslatedFeedbackChunk | undefined>(undefined);
    chunk = this.#chunk.asReadonly();
    #done = signal(false);
    done = this.#done.asReadonly();
    
    async translate(languagePair: LanguagePair, inputText: string): Promise<string> {
        try { 
            const translator = await Translator.create({
                ...languagePair,
                signal: this.#constroller.signal,
            });

            if (!translator) {
                return '';
            }

            const result = await translator.translate(inputText, { signal: this.#constroller.signal });
            translator.destroy();
            return result;
        } catch (e) {
            console.error(e);
            return '';
        }
    }

    #startTranslation() {
        this.#chunk.set(undefined);
        this.#done.set(false);
    }

    #processText(languagePair: LanguagePair, sourceLanguage: string, inputText: string) {
        this.#chunk.set({
            code: languagePair.sourceLanguage,
            targetCode: languagePair.targetLanguage,
            text: inputText,
        });
        this.#done.set(true);
    }

    async #createTranslator(languagePair: LanguagePair) {
        const translator = await Translator.create({
            ...languagePair,
            signal: this.#constroller.signal,
        });

        if (!translator) {
            throw new Error('Unable to create a translator to translate text.');
        }

        return translator;
    }

    async translateStream(languagePair: LanguagePair, sourceLanguage: string, inputText: string): Promise<void> {
        this.#startTranslation();

        if (languagePair.sourceLanguage === languagePair.targetLanguage) {
            return this.#processText(languagePair, sourceLanguage, inputText);
        }
        
        const translator = await this.#createTranslator(languagePair);

        const stream = await translator.translateStreaming(
            inputText, 
            { signal: this.#constroller.signal }
        );

        const self = this;
        const reader = stream.getReader();
        reader.read()
            .then(function processText({ value, done }): any {
                if (done) {
                    self.#done.set(done);
                    return;
                }

                self.#chunk.update((prev) => {
                    if (prev) {
                        return {
                            ...prev,
                            text: prev.text + value,
                        };
                    }
                    
                    return {
                        code: languagePair.sourceLanguage,
                        targetCode: languagePair.targetLanguage,
                        text: value
                    }
                });

                return reader.read().then(processText);
            })
            .catch((err) => {
                console.error(err);
                if (err instanceof Error) {
                    throw err;
                }
                throw new Error('Error in streaming the translation.');
            })
            .finally(() => {
                if (translator) {
                    console.log('Destroying the translator.');
                    translator.destroy();
                }
            });
    }

    ngOnDestroy(): void {
        this.#constroller.abort();
    }  
}

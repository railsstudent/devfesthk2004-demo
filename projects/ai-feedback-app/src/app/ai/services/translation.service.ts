import { Injectable, OnDestroy, signal } from '@angular/core';
import { LanguagePair } from '../types/language-pair.type';
import { TranslatedFeedbackChunk } from '../types/translation.type';
import { streamTextUtil } from '../utils/string-stream-reader.until';

@Injectable({
  providedIn: 'root'
})
export class TranslationService implements OnDestroy  {
    #constroller = new AbortController();
    #chunk = signal<TranslatedFeedbackChunk | undefined>(undefined);
    chunk = this.#chunk.asReadonly();
    #done = signal<boolean | undefined>(undefined);
    done = this.#done.asReadonly();
    
    #draft = signal<string>('');
    draft = this.#draft.asReadonly();
    #doneTranslatingDraft = signal<boolean | undefined>(undefined);
    doneTranslatingDraft = this.#doneTranslatingDraft.asReadonly();
    
    streamText = streamTextUtil();

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

    async translateDraftStream(languagePair: LanguagePair,  inputText: string): Promise<void> {
        if (languagePair.sourceLanguage === languagePair.targetLanguage) {
            this.#draft.set(inputText);
            return;
        }
        
        const translator = await this.#createTranslator(languagePair);

        const stream = await translator.translateStreaming(
            inputText, 
            { signal: this.#constroller.signal }
        );

        await this.streamText(stream, this.#draft, this.#doneTranslatingDraft, translator);
    }


    ngOnDestroy(): void {
        this.#constroller.abort();
    }  
}

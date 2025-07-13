import { Injectable, OnDestroy, signal } from '@angular/core';
import { LanguagePair } from '../types/language-pair.type';
import { streamTextUtil } from '../utils/string-stream-reader.until';

@Injectable({
  providedIn: 'root'
})
export class TranslationService implements OnDestroy  {
    #constroller = new AbortController();
 
    #chunk = signal<string>('');
    chunk = this.#chunk.asReadonly();
    #done = signal<boolean | undefined>(undefined);
    done = this.#done.asReadonly();
    
    #draft = signal<string>('');
    draft = this.#draft.asReadonly();
    #doneTranslatingDraft = signal<boolean | undefined>(undefined);
    doneTranslatingDraft = this.#doneTranslatingDraft.asReadonly();
    
    streamText = streamTextUtil();

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
        if (languagePair.sourceLanguage === languagePair.targetLanguage) {
            this.#chunk.set(inputText);
            this.#done.set(true);
            return;
        }
        
        const { stream, translator } = await this.createStream(languagePair, inputText);
        await this.streamText(stream, this.#chunk, this.#done, translator);
    }

    private async createStream(languagePair: LanguagePair, inputText: string) {
        const translator = await this.#createTranslator(languagePair);
        const stream = await translator.translateStreaming(
            inputText,
            { signal: this.#constroller.signal }
        );
        return { stream, translator };
    }

    async translateDraftStream(languagePair: LanguagePair,  inputText: string): Promise<void> {
        if (languagePair.sourceLanguage === languagePair.targetLanguage) {
            this.#draft.set(inputText);
            this.#doneTranslatingDraft.set(true);
            return;
        }
        
        const { stream, translator } = await this.createStream(languagePair, inputText);
        await this.streamText(stream, this.#draft, this.#doneTranslatingDraft, translator);
    }

    resetDraft() {
        this.#draft.set('');
    }

    ngOnDestroy(): void {
        this.#constroller.abort();
    }  
}

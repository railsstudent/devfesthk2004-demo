import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, resource, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs';
import { ENGLISH_CODE, ResponseWriterService } from '../services/response-writer.service';
import { TranslationInput } from '../types/sentiment-language.type';
import { FeedbackLoadingComponent } from './feeback-loading.componen';
import { FeedbackErrorComponent } from './feedback-error.component';

const transformTranslationInput = (x: TranslationInput) => ({ ...x, query: x.translatedText.trim() });

@Component({
    selector: 'app-response-writer',
    imports: [FormsModule, FeedbackErrorComponent, FeedbackLoadingComponent],  
    templateUrl: './response-writer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponseWriterComponent {
    translationInput = input.required<TranslationInput, TranslationInput>({ transform: transformTranslationInput });
    writerService = inject(ResponseWriterService);

    error = signal('');
    draft = linkedSignal(() => this.writerService.chunk());
    isGeneratingDraft = computed(() => { 
        const done = this.writerService.doneGenerating();
        return typeof done !== 'undefined' && !done;
    });

    // #draft$ = toObservable(this.draft).pipe(
    //   debounceTime(1000),
    //   filter((draft) => !!draft),
    //   distinctUntilChanged(),
    //   tap((draft) => console.log('#draft$', draft)),
    // );

    // debounceDraft = toSignal(this.#draft$, { initialValue: '' });

    // translatedDraft = resource({
    //   params: () => this.debounceDraft(),
    //   loader: ({ params: draft }) => {
    //     return this.writerService.translateDraft(this.translationInput().code, draft);
    //   } 
    // });

    isNonEnglish = computed(() => this.translationInput().code !== ENGLISH_CODE);
  
    async generateDraft() {
        this.error.set('');
        this.writerService.generateDraftStream(this.translationInput())
          .catch((error: Error) => this.error.set(error.message))
          // .finally(() => { 
          //   this.isLoading.set(false);
          // });

            // this.draft.set('');
            // this.translatedDraft.set('');
            // const { firstDraft, translation = '' } = await this.writerService.generateDraft(this.translationInput());
            // this.draft.set(firstDraft);
            // this.translatedDraft.set(translation);
        // } catch (e) {
        //     this.error.set((e as Error).message);
        // } finally {
        //     this.isLoading.set(false);
        // }
    }

    fakeSubmit() {
        // const stringifyDraft = JSON.stringify(this.isNonEnglish() ? this.translatedDraft.value() : this.draft());
        // alert('Submit ' + stringifyDraft + " to the backend.");
    }
}

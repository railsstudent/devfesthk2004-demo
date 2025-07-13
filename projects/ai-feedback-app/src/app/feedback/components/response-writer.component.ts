import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { filter, switchMap } from 'rxjs';
import { ResponseWriterService } from '../services/response-writer.service';
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
    draft = linkedSignal(() => this.writerService.draftChunk());
    isGeneratingDraft = computed(() => { 
        const done = this.writerService.doneGenerating();
        return typeof done !== 'undefined' && !done;
    });

    isTranslatingDraft = computed(() => { 
        const done = this.writerService.doneTranslating();
        return typeof done !== 'undefined' && !done;
    });
    
    translatedDraft = this.writerService.translateChunk;

    statusText = computed(() => {
        if (this.isGeneratingDraft()) {
            return 'Generating draft...';
        }

        if (this.isTranslatingDraft()) {
            return 'Translating draft...';
        }

        return '';
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

    isNonEnglish = computed(() => this.translationInput().code !== 'en');
  
    constructor() {
        toObservable(this.isGeneratingDraft)
            .pipe(
                filter((isGenerating) => !isGenerating && !!this.draft()),
                switchMap(() => {
                    return this.writerService.translateDraftStream(this.translationInput().code, this.draft())
                        .catch((e: Error) => this.error.set(e.message))
                }),
                takeUntilDestroyed(),
            )
            .subscribe();
    }

    async generateDraft() {
        this.error.set('');
        this.writerService.generateDraftStream(this.translationInput())
          .catch((error: Error) => this.error.set(error.message))
    }

    fakeSubmit() {
        const stringifyDraft = JSON.stringify(this.isNonEnglish() ? this.translatedDraft() : this.draft());
        alert('Submit ' + stringifyDraft + " to the backend.");
    }
}

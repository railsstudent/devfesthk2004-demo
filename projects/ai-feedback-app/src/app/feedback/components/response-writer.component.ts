import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
import { finishDrafting } from '../operators/finish_drafting.operator';
import { ResponseWriterService } from '../services/response-writer.service';
import { TranslationInput } from '../types/sentiment-language.type';
import { FeedbackLoadingComponent } from './feeback-loading.componen';
import { FeedbackErrorComponent } from './feedback-error.component';
import { TranslateDraftComponent } from './translate-draft.component';

const transformTranslationInput = (x: TranslationInput) => ({ ...x, query: x.translatedText.trim() });

@Component({
    selector: 'app-response-writer',
    imports: [FormsModule, TranslateDraftComponent, FeedbackErrorComponent, FeedbackLoadingComponent],  
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
        } else if (this.isTranslatingDraft()) {
            return 'Translating draft...';
        }

        return '';
    });
 
    constructor() {
        const isGeneratingDraft$ = toObservable(this.isGeneratingDraft);
        const hasDraft$ = toObservable(this.draft).pipe(finishDrafting(isGeneratingDraft$));

        hasDraft$.pipe(
            switchMap((draft) => {
                this.error.set('');
                return this.writerService.translateDraftStream(this.translationInput().code, draft)
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
        const text = this.translationInput().code !== 'en' ? this.translatedDraft() : this.draft();
        const stringifyDraft = JSON.stringify(text);
        alert(`Submit ${stringifyDraft} to the backend.`);
    }
}

import { ChangeDetectionStrategy, Component, computed, inject, input, OnDestroy, resource, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { LineBreakPipe } from '../pipes/line-break.pipe';
import { ENGLISH_CODE, ResponseWriterService } from '../services/response-writer.service';
import { TranslationInput } from '../types/translation-input.type';
import { FeedbackLoadingComponent } from './feeback-loading.componen';
import { FeedbackErrorComponent } from './feedback-error.component';

const transformTranslationInput = (x: TranslationInput) => ({ ...x, query: x.query.trim() });

@Component({
  selector: 'app-response-writer',
  standalone: true,
  imports: [FormsModule, LineBreakPipe, FeedbackErrorComponent, FeedbackLoadingComponent],
  template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>Write a response</h3>
      @let disabled = isLoading() || translationInput().query === '' || translationInput().sentiment === '';
      @let disableSubmit = isLoading() || draft().trim() === '';
      <app-feedback-loading [isLoading]="isLoading()">Generating...</app-feedback-loading>
      <div style="margin-bottom: 0.5rem;">
        <textarea id="input" name="input" rows="7" [(ngModel)]="draft" [disabled]="isLoading()"></textarea>
        <button style="margin-right: 0.5rem;" (click)="generateDraft()" [disabled]="disabled">Generate a draft</button>
        <button [disabled]="disableSubmit" (click)="fakeSubmit()">Fake submit</button>
      </div>
      @let translatedDraftValue = translatedDraft.value();
      @if (isNonEnglish() && translatedDraftValue) {
        <div>
            <h3>Translate back to original language</h3>
            <p [innerHTML]="translatedDraftValue | lineBreak"></p>
        </div>
      }
      <app-feedback-error [error]="error()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponseWriterComponent implements OnDestroy {
    translationInput = input.required<TranslationInput, TranslationInput>({ transform: transformTranslationInput });
    writerService = inject(ResponseWriterService);

    isLoading = signal(false);
    error = signal('');
    draft = signal('');
    debounceDraft = toSignal(toObservable(this.draft).pipe(debounceTime(1000)), { initialValue: '' });

    translatedDraft = resource({
      request: () => this.debounceDraft(),
      loader: ({ request: draft, abortSignal }) => {
        return this.writerService.translateDraft(draft, this.translationInput().code);
      } 
    });

    isNonEnglish = computed(() => this.translationInput().code !== ENGLISH_CODE);
  
    async generateDraft() {
        try {
            this.isLoading.set(true);
            this.error.set('');
            this.draft.set('');
            this.translatedDraft.set('');
            const { firstDraft, translation = '' } = await this.writerService.generateDraft(this.translationInput());
            this.draft.set(firstDraft);
            this.translatedDraft.set(translation);
        } catch (e) {
            this.error.set((e as Error).message);
        } finally {
            this.isLoading.set(false);
        }
    }

    fakeSubmit() {
        const stringifyDraft = JSON.stringify(this.isNonEnglish() ? this.translatedDraft.value() : this.draft());
        alert('Submit ' + stringifyDraft + " to the backend.");
    }

    ngOnDestroy(): void {
        this.writerService.destroySessions();
    }
}

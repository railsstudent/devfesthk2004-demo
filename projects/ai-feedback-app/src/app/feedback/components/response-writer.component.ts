import { ChangeDetectionStrategy, Component, computed, inject, input, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LineBreakPipe } from '../pipes/line-break.pipe';
import { ResponseWriterService } from '../services/response-writer.service';
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
      @if (isNonEnglish() && translatedDraft()) {
        <div>
            <h3>Translate back to original language</h3>
            <p [innerHTML]="translatedDraft() | lineBreak"></p>
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
    translatedDraft = signal('');

    isNonEnglish = computed(() => this.translationInput().code !== 'en');
    
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
        const stringifyDraft = JSON.stringify(this.isNonEnglish() ? this.translatedDraft() : this.draft());
        alert('Submit ' + stringifyDraft + " to the backend.");
    }

    ngOnDestroy(): void {
        this.writerService.destroySessions();
    }
}

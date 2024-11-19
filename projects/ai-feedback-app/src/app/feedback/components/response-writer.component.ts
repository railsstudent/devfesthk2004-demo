import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, Injector, input, OnDestroy, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LineBreakPipe } from '../pipes/line-break.pipe';
import { ResponseWriterService } from '../services/response-writer.service';
import { TranslationInput } from '../types/translation-input.type';
import { FeedbackErrorComponent } from './feedback-error.component';
import { FeedbackLoadingComponent } from './feeback-loading.componen';

@Component({
  selector: 'app-response-writer',
  standalone: true,
  imports: [FormsModule, LineBreakPipe, FeedbackErrorComponent, FeedbackLoadingComponent],
  template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>Write a response</h3>
      @let disabled = isLoading() || feedback() === '' || sentiment() === '';
      @let disableSubmit = isLoading() || draft().trim() === '';
      <app-feedback-loading [isLoading]="isLoading()">Generating...</app-feedback-loading>
      <div style="margin-bottom: 0.5rem;">
        <textarea id="input" name="input" rows="7" [(ngModel)]="draft" [disabled]="isLoading()" #response></textarea>
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
    translationInput = input.required<TranslationInput, TranslationInput>({ transform: (x) => ({ 
        ...x,
        query: x.query.trim(),
      }) 
    });
    writerService = inject(ResponseWriterService);
    injector = inject(Injector);

    textArea = viewChild.required<ElementRef<HTMLTextAreaElement>>('response');

    isLoading = signal(false);
    error = signal('');
    draft = signal('');
    translatedDraft = signal('');

    feedback = computed(() => this.translationInput().query.trim());
    sentiment = computed(() => this.translationInput().sentiment);
    isNonEnglish = computed(() => this.translationInput().code !== 'en');
    stringifyDraft = computed(() => JSON.stringify(this.isNonEnglish() ? this.translatedDraft() : this.draft()));
    
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
        alert('Submit ' + this.stringifyDraft() + " to the backend.");
    }

    ngOnDestroy(): void {
        this.writerService.destroySessions();
    }
}

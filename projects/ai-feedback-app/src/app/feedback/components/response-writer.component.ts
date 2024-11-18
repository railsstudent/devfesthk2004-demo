import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, Injector, input, OnDestroy, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LineBreakPipe } from '../pipes/line-break.pipe';
import { FeedbackTranslationService } from '../services/feedback-translation.service';
import { ResponseWriterService } from '../services/response-writer.service';
import { TranslationInput } from '../types/translation-input.type';

@Component({
  selector: 'app-response-writer',
  standalone: true,
  imports: [FormsModule, LineBreakPipe],
  template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>Write a response</h3>
      @let disabled = isLoading() || feedback() === '' || sentiment() === '';
      @let disableSubmit = isLoading() || draft().trim() === '';
      @if (isLoading()) {
        <div>
            <span class="label">Status: </span><span>Generating...</span>
        </div>
      }
      <div style="margin-bottom: 0.5rem;">
        <textarea id="input" name="input" rows="7" [(ngModel)]="draft" [disabled]="isLoading()" #response></textarea>
        <button style="margin-right: 0.5rem;" (click)="generateDraft()" [disabled]="disabled">Generate a draft</button>
        <button [disabled]="disableSubmit" (click)="fakeSubmit()">Fake submit</button>
      </div>
      @if (isNonEnglish()) {
      <div>
            <h3>Translate back to original language</h3>
            <p [innerHTML]="translatedDraft() | lineBreak"></p>
      </div>
      }
      @if (error()) {
        <div>
          <span class="label">Error: </span>
          <p>{{ error() }}</p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponseWriterComponent implements OnDestroy {
    translationInput = input.required<TranslationInput>();
    writerService = inject(ResponseWriterService);
    translationService = inject(FeedbackTranslationService);
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
            const text = await this.writerService.generateDraft(this.feedback(), this.sentiment());
            this.draft.set(text);
            if (this.isNonEnglish()) {
                const translation = await this.translationService.translate(text, {
                    sourceLanguage: 'en',
                    targetLanguage: this.translationInput().code
                });
                this.translatedDraft.set(translation);
            }
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

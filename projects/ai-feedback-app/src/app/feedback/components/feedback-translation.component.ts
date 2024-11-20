import { ChangeDetectionStrategy, Component, computed, inject, Injector, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { LanguagePair } from '../../ai/types/language-pair.type';
import { FeedbackTranslationService } from '../services/feedback-translation.service';
import { TranslationInput } from '../types/translation-input.type';
import { ResponseWriterComponent } from './response-writer.component';

@Component({
  selector: 'app-feedback-translation',
  standalone: true,
  imports: [ResponseWriterComponent],
  template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <div style="margin-bottom: 0.5rem;">
        @for (pair of languagePairs(); track pair.targetLanguage) {
          <button style="margin-right: 0.5rem;" (click)="translate(pair)" [disabled]="isLoading()">
            {{ pair.sourceLanguage }} to {{ pair.targetLanguage }}
          </button>
        }
      </div>

      @let labelText = this.languagePairs().length ? 'Translation: ' : 'Original Text: ';
      <div style="margin-bottom: 0.5rem;">
        <p><span class="label">{{ labelText }}</span> {{ feedback() }}</p>
        <p><span class="label">Summary: </span> {{ summary() }}</p>
      </div>
      <app-response-writer [translationInput]="writerInput()"  />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackTranslationComponent {
  translationInput = input.required<TranslationInput>();
  translationService = inject(FeedbackTranslationService);
  translation = signal('');
  isLoading = signal(false);

  injector = inject(Injector);
  languagePairs = toSignal(this.translationService.getLanguagePairs(this.translationInput, this.injector), 
    { initialValue: [] as LanguagePair[] });

  originalText = computed(() => this.translationInput()?.query || '');
  feedback = computed(() => this.languagePairs().length ? this.translation() : this.originalText());
  writerInput = computed<TranslationInput>(() => {
    return {
      code: this.translationInput().code, 
      query: this.feedback(),
      sentiment: this.translationInput().sentiment,
    }
  })

  summary = toSignal(toObservable(this.feedback)
    .pipe(
      filter((value) => !!value),
      switchMap((value: string) => this.translationService.summarize(value))
    ), { initialValue: '' }
  );

  async translate(pair: LanguagePair) {
    try {
      const translationInput = this.translationInput();
      if (translationInput) {
        this.isLoading.set(true);
        this.translation.set('');
        const result = await this.translationService.translate(translationInput.query, pair);
        this.translation.set(result);
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}

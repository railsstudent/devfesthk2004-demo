import { ChangeDetectionStrategy, Component, computed, inject, Injector, input, resource, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LanguagePair } from '../../ai/types/language-pair.type';
import { FeedbackTranslationService } from '../services/feedback-translation.service';
import { TranslationInput } from '../types/translation-input.type';
import { FeedbackLoadingComponent } from './feeback-loading.componen';
import { ResponseWriterComponent } from './response-writer.component';

@Component({
  selector: 'app-feedback-translation',
  standalone: true,
  imports: [ResponseWriterComponent, FeedbackLoadingComponent],
  template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <app-feedback-loading [isLoading]="isLoading()">Translating...</app-feedback-loading>
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
        <p><span class="label">Summary: </span> {{ summary.value() }}</p>
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
  
  summary = resource({
    request: () => this.feedback(),
    loader: async ({ request: query }) => {
      if (await this.translationService.canSummarize(query)) {
        return this.translationService.summarize(query);
      }
      return '';
    } 
  });

  async translate(pair: LanguagePair) {
    try {
      if (this.translationInput()) {
        this.isLoading.set(true);
        this.translation.set('');
        const result = await this.translationService.translate(this.translationInput().query, pair);
        this.translation.set(result);
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}

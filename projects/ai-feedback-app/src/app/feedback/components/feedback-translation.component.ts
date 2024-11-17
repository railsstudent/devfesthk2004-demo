import { ChangeDetectionStrategy, Component, inject, Injector, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LanguagePair } from '../../ai/types/language-pair.type';
import { FeedbackTranslationService } from '../services/feedback-translation.service';
import { TranslationInput } from '../types/translation-input.type';

@Component({
  selector: 'app-feedback-translation',
  standalone: true,
  imports: [],
  template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      @for (pair of languagePairs(); track pair.targetLanguage) {
        <button style="margin-right: 0.5rem;" (click)="translate(pair)" [disabled]="isLoading()">
          {{ pair.sourceLanguage }} to {{ pair.targetLanguage }}
        </button>
      }

      @if (languagePairs().length) {
      <div>
        <p><span class="label">Translation: </span> {{ translation() }}</p>
      </div>
      } @else {
        <div>
          <p><span class="label">Original text: </span> {{ translationInput()?.query || '' }}</p>
        </div>
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackTranslationComponent {
  translationInput = input.required<TranslationInput | undefined>();
  translationService = inject(FeedbackTranslationService);
  translation = signal('');
  isLoading = signal(false);

  injector = inject(Injector);
  languagePairs = toSignal(this.translationService.getLanguagePairs(this.translationInput, this.injector), 
    { initialValue: [] as LanguagePair[] });

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

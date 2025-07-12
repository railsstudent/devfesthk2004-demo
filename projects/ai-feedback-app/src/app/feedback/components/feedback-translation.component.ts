import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { FeedbackSummaryService } from '../services/feedback-summary.service';
import { TranslatedFeedbackWithSentiment } from '../types/sentiment-language.type';
import { FeedbackLoadingComponent } from './feeback-loading.componen';
import { ResponseWriterComponent } from './response-writer.component';

@Component({
    selector: 'app-feedback-translation',
    imports: [ResponseWriterComponent, FeedbackLoadingComponent],
    templateUrl: './feedback-translation.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackTranslationComponent {
  translationInput = input.required<TranslatedFeedbackWithSentiment>();
  summaryService = inject(FeedbackSummaryService);
  
  writerInput = computed(() => {
    const { code, translatedText, sentiment  } = this.translationInput();
    return {
      code, 
      translatedText, 
      sentiment,
    }
  });
  
  isLoading = computed(() => !this.summaryService.done());
  error = signal('');
  translatedText = computed(() => this.translationInput().translatedText);
  summaryValue = this.summaryService.chunk;

  constructor() {
    toObservable(this.translatedText)
      .pipe(
        filter((text) => !!text),
        switchMap((text) => {
          this.error.set('');
          return this.summaryService.summarizeStream(text)
            .catch((e: Error) => this.error.set(e.message))
        }),
        takeUntilDestroyed(),
      )
    .subscribe();
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, input, resource } from '@angular/core';
import { FeedbackSummaryService } from '../services/feedback-summary.service';
import { TranslatedFeedbackWithPair } from '../types/sentiment-language.type';
import { FeedbackLoadingComponent } from './feeback-loading.componen';
import { ResponseWriterComponent } from './response-writer.component';

@Component({
    selector: 'app-feedback-translation',
    imports: [ResponseWriterComponent, FeedbackLoadingComponent],
    templateUrl: './feedback-translation.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackTranslationComponent {
  translationInput = input.required<TranslatedFeedbackWithPair>();
  summaryService = inject(FeedbackSummaryService);
  
  writerInput = computed(() => {
    return {
      code: this.translationInput().code, 
      translatedText: this.translationInput().translatedText,
      sentiment: this.translationInput().sentiment,
    }
  });
  
  summary = resource({
    params: () => this.translationInput().translatedText,
    loader: async ({ params: text }) => this.summaryService.summarize(text)
  });

  summaryValue = computed(() => this.summary.hasValue() ? this.summary.value() : '');
  isLoading = computed(() => this.summary.isLoading());
}

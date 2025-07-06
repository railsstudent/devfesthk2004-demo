import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FeedbackTranslationService } from '../services/feedback-translation.service';
import { TranslatedFeedbackWithPair } from '../types/sentiment-language.type';

@Component({
    selector: 'app-feedback-translation',
    imports: [/*ResponseWriterComponent,*/],
    template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">      
      @let code = translationInput().code;
      @let targetCode = translationInput().targetCode;
      <div style="margin-bottom: 0.5rem;">
        {{ code }} to {{ targetCode }}
      </div>

      @let labelText = targetCode !== code ? 'Translation: ' : 'Original Text: ';
      <div style="margin-bottom: 0.5rem;">
        <p><span class="label">{{ labelText }}</span> {{ translationInput().translatedText }}</p>
        <!-- <p><span class="label">Summary: </span> {{ summary.value() }}</p> -->
      </div>
      <!-- <app-response-writer [translationInput]="writerInput()"  /> -->
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackTranslationComponent {
  translationInput = input.required<TranslatedFeedbackWithPair>();
  translationService = inject(FeedbackTranslationService);
  
  // writerInput = computed<TranslationInput>(() => {
  //   return {
  //     code: this.translationInput().code, 
  //     query: this.feedback(),
  //     sentiment: this.translationInput().sentiment,
  //   }
  // })
  
  // summary = resource({
  //   params: () => this.feedback(),
  //   loader: async ({ params: query }) => {
  //     if (await this.translationService.canSummarize(query)) {
  //       return this.translationService.summarize(query);
  //     }
  //     return '';
  //   } 
  // });
}

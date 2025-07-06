import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FeedbackSentimentComponent } from './components/feedback-sentiment.component';
// import { FeedbackTranslationComponent } from './components/feedback-translation.component';
import { TranslationInput } from './types/translation-input.type';

@Component({
    selector: 'app-feedback-container',
    imports: [FeedbackSentimentComponent /*, FeedbackTranslationComponent*/],
    template: `
    <app-feedback-sentiment (sentimentLanguageEvaluated)="translationInput.set($event)" />
    <!-- @let input = translationInput();
    @if (input) {
      <app-feedback-translation [translationInput]="input" />
    } -->
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackContainerComponent {
  translationInput = signal<TranslationInput | undefined>(undefined);
}

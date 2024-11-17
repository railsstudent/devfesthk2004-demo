import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeedbackSentimentComponent } from './components/feedback-sentiment.component';
import { FeedbackTranslationComponent } from './components/feedback-translation.component';
import { TranslationInput } from './types/translation-input.type';

@Component({
  selector: 'app-feedback-container',
  standalone: true,
  imports: [FeedbackSentimentComponent, FeedbackTranslationComponent],
  template: `
    <app-feedback-sentiment (sentimentLanguageEvaluated)="translationInput.set($event)" />
    @if (translationInput()) {
      <app-feedback-translation [translationInput]="translationInput()" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackContainerComponent {
  translationInput = signal<TranslationInput | undefined>(undefined);
}

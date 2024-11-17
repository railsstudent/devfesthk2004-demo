import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeedbackService } from './services/feedback.service';
import { FeedbackSentimentComponent } from './components/feedback-sentiment.component';
import { FeedbackTranslationComponent } from './components/feedbacl-translation.component';
import { SentimentLanguage } from './types/sentiment-language.type';

@Component({
  selector: 'app-feedback-container',
  standalone: true,
  imports: [FormsModule, FeedbackSentimentComponent, FeedbackTranslationComponent],
  template: `
    <app-feedback-sentiment (sentimentLanguageEvaluated)="handleSentimentLanguage($event)" />
    <app-feedback-translation />
    <!-- <label class="label" for="input">Input customer feedback: </label>
    <textarea rows="8" id="input" name="input" [(ngModel)]="feedback"></textarea>
    <button (click)="submit()" [disabled]="buttonState().disabled">{{ buttonState().text }}</button>
    @let state = feedbackState();
    <div>
      <p>
        <span class="label">Language: </span>{{ state.language }}
      </p>
      <p>
        <span class="label">Categories: </span>
        @for (category of state.categories; track $index) {
          <p>{{ category.sentiment }}, {{ category.score }}</p>
        }
      </p>
      <p>
        <span class="label">Prompt: </span>{{ state.prompt }}
      </p>
    </div>
    <div>
      <span class="label">Response:</span>
      <p>{{ state.response }}</p>
    </div>
    <div>
      @if (error()) {
        <p>Error: {{ error() }}</p>
      }
    </div> -->
  `,
  styles: `
    textarea {
      width: 100%;
    }

    button {
      margin-bottom: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackContainerComponent {
  handleSentimentLanguage(result: SentimentLanguage | undefined) {
    console.log(result);
  }
}

import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { isPromptApiSupported } from './ai/utils/prompt-api-detection';
import { FeedbackContainerComponent } from './feedback/feedback-container.component';
import { isTranslationApiSupported } from './ai/utils/translation-api-detection';
import { isSummarizationAPISupported } from './ai/utils/summarization-api-detection';

@Component({
  selector: 'app-detect-ai',
  standalone: true,
  imports: [FeedbackContainerComponent],
  template: `
    <div>
      @let errors = hasCapabilities();
      @if (!errors.length) {
        <app-feedback-container />
      } @else if (errors.includes('unknown')) {
        <p>If you're on Chrome, join the Early Preview Program to enable it.</p>
      } @else {
        <h4 class="error">Errors</h4>
        <ul>
          @for (error of errors; track $index) {
            <li>{{ error }}</li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    .error {
      text-decoration: underline; 
      color: black; 
      font-style: italic; 
      font-size: 1.1rem;
    } 

    li {
      margin-left: 0.75rem;
      line-height: 1.15rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetectAIComponent {
  hasPromptCapabilities = toSignal(isPromptApiSupported(), { initialValue: '' });
  hasTranlsationCapabilities = toSignal(isTranslationApiSupported(), { initialValue: '' });
  hasSummarizationCapabilities = toSignal(isSummarizationAPISupported(), { initialValue: '' });

  hasCapabilities = computed(() => {
    const allCapabilities = [ this.hasPromptCapabilities(), this.hasTranlsationCapabilities(), 
      this.hasSummarizationCapabilities()];
    return allCapabilities.reduce((acc, text) => text !== '' ? acc.concat(text) : acc, [] as string[]);
  });
}

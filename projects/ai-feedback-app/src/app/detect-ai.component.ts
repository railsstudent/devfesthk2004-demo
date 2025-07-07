import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { isPromptApiSupported } from './ai/utils/prompt-api-detection';
import { isSummarizationAPISupported } from './ai/utils/summarization-api-detection';
import { isTranslationApiSupported } from './ai/utils/translation-api-detection';
import { isWriterAPISupported } from './ai/utils/writer-api-detection';
import { FeedbackContainerComponent } from './feedback/feedback-container.component';
import { combineLatest, map, reduce } from 'rxjs';
import { isLanguageDetectionApiSupported } from './ai/utils/language-detection-api-detection';

@Component({
    selector: 'app-detect-ai',
    imports: [FeedbackContainerComponent],
    template: `
    <div>
      @let errors = capabilityErrors();
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
  errors$ = combineLatest([
    isPromptApiSupported(), 
    isTranslationApiSupported(), 
    isSummarizationAPISupported(),
    isWriterAPISupported(),
    isLanguageDetectionApiSupported()
  ]).pipe(
    map((results) => 
      results.reduce((acc, text) => 
        text !== '' ? acc.concat(text) : acc, [] as string[])
    )
  );

  capabilityErrors = toSignal(this.errors$, { initialValue: [] as string[] });

  // hasCapabilities = computed(() => {
  //   const allCapabilities = [ 
  //     this.hasPromptCapabilities(), 
  //     this.hasTranlsationCapabilities(), 
  //     this.hasSummarizationCapabilities(), 
  //     this.hasWriterCapabilities()
  //   ];
  //   return allCapabilities.reduce((acc, text) => text !== '' ? acc.concat(text) : acc, [] as string[]);
  // });
}

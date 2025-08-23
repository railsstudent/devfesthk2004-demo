import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { isLanguageDetectionAPISupported } from './ai/utils/ai-detection';
import { LanguageDetectionComponent } from './language-detection/language-detection.component';

@Component({
    selector: 'app-detect-ai',
    imports: [LanguageDetectionComponent],
    template: `
    <div>
      <p style="margin-bottom: 0.5rem;">
        Explainer: <a href="https://developer.mozilla.org/en-US/docs/Web/API/Translator_and_Language_Detector_APIs">
        https://developer.mozilla.org/en-US/docs/Web/API/Translator_and_Language_Detector_APIs
        </a>
      </p>
      @let error = hasCapability();
      @if (!error) {
        <app-language-detection />
      } @else if (error !== 'unknown') {
        {{ error }}
      } @else {
        <p>If you're on Chrome, join the <a href="https://developer.chrome.com/docs/ai/built-in#get_an_early_preview" target="_blank">
          Early Preview Program</a> to enable it.
        </p>
      }
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetectAIComponent {
  hasCapability = toSignal(isLanguageDetectionAPISupported(), { initialValue: '' });
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LanguageDetectionWithNameResult } from '../../ai/types/language-detection-result.type';

@Component({
  selector: 'app-language-detection-result',
  standalone: true,
  template: `
    <div>
        <span class="label">Response: </span>
        @for (language of detectedLanguages(); track language.detectedLanguage) {
          <p>
            <span>Confidence: {{ language.confidence.toFixed(3) }}, </span>
            <span>Detected Language: {{ language.detectedLanguage }}, </span>
            <span>Detected Language Name: {{ language.name }}</span>
          </p>
        }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageDetectionResultComponent {
    detectedLanguages = input<LanguageDetectionWithNameResult[]>([]);
}

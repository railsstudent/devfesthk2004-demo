import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LanguageDetectionWithNameResult } from '../../ai/types/language-detection-result.type';
import { ConfidencePipe } from '../pipes/confidence.pipe';

@Component({
  selector: 'app-language-detection-result',
  imports: [ConfidencePipe],
  standalone: true,
  template: `
    <div>
        <span class="label">Response: </span>
        @for (language of detectedLanguages(); track language.detectedLanguage) {
          <p>
            <span>Confidence: {{ language.confidence | confidence:minConfidence() }}, </span>
            <span>Detected Language: {{ language.detectedLanguage }}, </span>
            <span>Detected Language Name: {{ language.name }}</span>
          </p>
        }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageDetectionResultComponent {
    detectedLanguages = input.required<LanguageDetectionWithNameResult[]>();
    minConfidence = input.required<number, number>({ transform: (data) => data < 0 || data > 1 ? 0.6 : data });
}

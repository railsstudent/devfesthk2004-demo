import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LanguageDetectionWithNameResult } from '../../ai/types/language-detection-result.type';
import { ConfidencePipe } from '../pipes/confidence.pipe';

@Component({
    selector: 'app-language-detection-result',
    imports: [ConfidencePipe],
    template: `
    <div>
        <span class="label">Response: </span>
        @let language = detectedLanguage();
        @if (language) {
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
    detectedLanguage = input.required<LanguageDetectionWithNameResult | undefined>();
    minConfidence = input.required<number, number>({ transform: (data) => data < 0 || data > 1 ? 0.6 : data });
}

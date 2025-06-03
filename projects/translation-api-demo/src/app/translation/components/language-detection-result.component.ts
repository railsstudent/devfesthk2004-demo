import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LanguageDetectionWithNameResult } from '../../ai/types/language-detection-result.type';

@Component({
    selector: 'app-language-detection-result',
    template: `
    <div>
        <span class="label">Response: </span>
        @let language = detectedLanguage();
        @if (language) {
          @let value = language.confidence;
          <p>
            @if (!value) {
              <span>No Confidence</span>
            } @else {
              @let level = value >= minConfidence() ? 'High Confidence' : 'Low Confidence';
              <span>Confidence: {{ value.toFixed(3) }} ({{ level }})</span>
            }
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

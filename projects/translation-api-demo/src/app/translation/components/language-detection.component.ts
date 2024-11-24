import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageDetectionService } from '../../ai/services/language-detection.service';
import { LanguageDetectionWithNameResult } from '../../ai/types/language-detection-result.type';
import { LanguageDetectionResultComponent } from './language-detection-result.component';
import { AllowTranslation } from '../types/allow-translation.type';

@Component({
    selector: 'app-language-detection',
    imports: [FormsModule, LanguageDetectionResultComponent],
    template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <div>
        <span class="label" for="input">Input text: </span>
        <textarea id="input" name="input" [(ngModel)]="inputText" rows="3"></textarea>
      </div>
      <button style="margin-right: 0.5rem;" (click)="setup()">Create language detector</button>
      <button (click)="detectLanguage()" [disabled]="isDisableDetectLanguage()">Detect Language</button>
      <app-language-detection-result [detectedLanguage]="detectedLanguage()" [minConfidence]="minConfidence" />
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageDetectionComponent {
  service = inject(LanguageDetectionService);
  inputText = signal('Buenos tarde. Mucho Gusto. Hoy es 23 de Noviembre, 2024 y Mi charla es sobre Chrome Built-in AI.');
  detectedLanguage = signal<LanguageDetectionWithNameResult | undefined>(undefined);

  detector = this.service.detector;
  isDisableDetectLanguage = computed(() => !this.detector() || this.inputText().trim() === '');
  nextStep = output<AllowTranslation>();

  minConfidence = 0.6;

  async setup() {
    await this.service.createDetector();
  }

  async detectLanguage() {
    const inputText = this.inputText().trim();
    const result = await this.service.detect(inputText, this.minConfidence);
    this.detectedLanguage.set(result);

    if (result?.detectedLanguage) {
      this.nextStep.emit({
        code: result.detectedLanguage,
        toTranslate: result.confidence >= this.minConfidence,
        inputText,
      });
    } else {
      this.nextStep.emit(undefined);
    }
  }
}

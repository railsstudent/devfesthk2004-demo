import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageDetectorService } from '../../ai/services/language-detector.service';
import { LanguageDetectionWithNameResult } from '../../ai/types/language-detection-result.type';
import { AllowTranslation } from '../types/allow-translation.type';
import { LanguageDetectionResultComponent } from './language-detection-result.component';

@Component({
    selector: 'app-language-detection',
    imports: [FormsModule, LanguageDetectionResultComponent],
    template: `
    <div class="detection-container">
      <div>
        <span class="label" for="input">Input text: </span>
        <textarea id="input" name="input" [(ngModel)]="inputText" rows="3"></textarea>
      </div>
      <button style="margin-right: 0.5rem;" (click)="setup()">Create the Language Detector</button>
      <button (click)="detectLanguage()" [disabled]="isDisableDetectLanguage()">Detect the Language</button>
      <app-language-detection-result [detectedLanguage]="detectedLanguage()" [minConfidence]="minConfidence" />
      <div>
        <p>Error: {{strError()}}</p>
      </div>
    </div>
  `,
  styles: `
    div.detection-container { 
      border: 1px solid black; 
      border-radius: 0.25rem; 
      padding: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageDetectionComponent {
  service = inject(LanguageDetectorService);
  inputText = signal('Buenos tarde. Mucho Gusto. Hoy es 23 de Noviembre, 2024 y Mi charla es sobre Chrome Built-in AI.');
  detectedLanguage = signal<LanguageDetectionWithNameResult | undefined>(undefined);

  detector = this.service.detector;
  strError = this.service.strError;
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
      const toTranslate = typeof result.confidence !== 'undefined'
        && result.confidence >= this.minConfidence;
      this.nextStep.emit({
        code: result.detectedLanguage,
        toTranslate,
        inputText,
      });
    } else {
      this.nextStep.emit(undefined);
    }
  }
}

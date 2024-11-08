import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageDetectionService } from '../../ai/services/language-detection.service';
import { LanguageDetectionWithNameResult } from '../../ai/types/language-detection-result.type';
import { LanguageDetectionResultComponent } from './language-detection-result.component';

@Component({
  selector: 'app-language-detection',
  standalone: true,
  imports: [FormsModule, LanguageDetectionResultComponent],
  template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <div>
        <span class="label" for="input">Input text: </span>
        <textarea id="input" name="input" [(ngModel)]="inputText" rows="3"></textarea>
      </div>
      <button style="margin-right: 0.5rem;" (click)="setup()">Create language detector</button>
      <button (click)="detectLanguage()" [disabled]="isDisableDetectLanguage()">Detect Language</button>
      <app-language-detection-result [detectedLanguages]="detectedLanguages()" [minConfidence]="minConfidence" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageDetectionComponent {
  service = inject(LanguageDetectionService);
  inputText = signal('');
  detectedLanguages = signal<LanguageDetectionWithNameResult[]>([]);
  showUnrecognizeError = signal(false);

  detector = this.service.detector;

  isDisableDetectLanguage = computed(() => !this.detector() || this.inputText().trim() === '');
  minConfidence = 0.6

  async setup() {
    await this.service.createDetector();
  }

  async detectLanguage() {
    this.showUnrecognizeError.set(false);
    const inputText = this.inputText().trim();
    const results = await this.service.detect(inputText, this.minConfidence);
    this.detectedLanguages.set(results);

    this.showUnrecognizeError.set(results.length <= 0 && inputText !== '');
  }
}

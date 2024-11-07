import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageDetectionService } from '../ai/services/language-detection.service';
import { LanguageAvailable } from '../ai/types/language-available.type';
import { LanguageDetectionWithNameResult } from '../ai/types/language-detection-result.type';

@Component({
  selector: 'app-language-detection',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>Language Detection Demo</h3>
      <div>
        @for (language of languagesAvailable(); track language.code) {
          <p>Is {{ language.name }} available? {{language.available }}</p>
        }
      </div>
      <div>
        <span class="label" for="input">Input text: </span>
        <textarea id="input" name="input" [(ngModel)]="inputText" rows="3"></textarea>
      </div>
      <button style="margin-right: 0.5rem;" (click)="setup()">Create capabilities and detector</button>
      <button style="margin-right: 0.5rem;" (click)="teardown()">Destroy capabilities and detector</button>
      <button (click)="detectLanguage()" [disabled]="isDisableDetectLanguage()">Detect Language</button>
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
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageDetectionComponent {
  service = inject(LanguageDetectionService);
  inputText = signal('');
  detectedLanguages = signal<LanguageDetectionWithNameResult[]>([]);
  languagesAvailable = signal<LanguageAvailable[]>(['en', 'zh', 'es', 'it'].map((code) => ({
    code,
    name: this.service.languageTagToHumanReadable(code) || 'NA',
    available: 'no'
  })));

  capabilities = this.service.capabilities;
  detector = this.service.detector;

  isDisableDetectLanguage = computed(() => !this.capabilities() || !this.detector()
    || this.inputText().trim() === '');

  async setup() {
    await this.service.createCapabilities();
    await this.service.createDetector();
    const languages = this.languagesAvailable().map(({ code }) => ({
      code,
      name: this.service.languageTagToHumanReadable(code) || 'NA',
      available: this.capabilities().languageAvailable(code),
    }));
    this.languagesAvailable.set(languages);
  }

  async teardown() {
    await this.service.destroyCapabilities();
    await this.service.destroyDetector();
    const languages = this.languagesAvailable().map(({ code }) => ({
      code,
      name: this.service.languageTagToHumanReadable(code) || 'NA',
      available: 'no',
    }));
    this.languagesAvailable.set(languages);
  }

  async detectLanguage(topNLanguages = 3) {
    const results = await this.service.detect(this.inputText(), topNLanguages);
    this.detectedLanguages.set(results);
  }
}

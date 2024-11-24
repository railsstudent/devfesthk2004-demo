import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageDetectionService } from '../ai/services/language-detection.service';
import { LanguageAvailable } from '../ai/types/language-available.type';
import { LanguageDetectionWithNameResult } from '../ai/types/language-detection-result.type';
import { LanguageAvailabledComponent } from './components/language-available.component';
import { LanguageDetectionResultComponent } from './components/language-detection-result.component';

@Component({
    selector: 'app-language-detection',
    imports: [FormsModule, LanguageAvailabledComponent, LanguageDetectionResultComponent],
    template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>Language Detection Demo</h3>
      <app-language-available [languagesAvailable]="languagesAvailable()" />
      <div>
        <span class="label" for="input">Input text: </span>
        <textarea id="input" name="input" [(ngModel)]="inputText" rows="3"></textarea>
      </div>
      <button style="margin-right: 0.5rem;" (click)="setup()">Create capabilities and detector</button>
      <button style="margin-right: 0.5rem;" (click)="teardown()">Destroy capabilities and detector</button>
      <button (click)="detectLanguage()" [disabled]="isDisableDetectLanguage()">Detect Language</button>
      <app-language-detection-result [detectedLanguages]="detectedLanguages()" />
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

  isUnavailable = computed(() => !this.capabilities() || this.capabilities()?.available !== 'readily');
  isDisableDetectLanguage = computed(() => this.isUnavailable() || !this.detector() || this.inputText().trim() === '');

  async setup() {
    await this.service.createCapabilities();
    await this.service.createDetector();
    const languages = this.languagesAvailable().map(({ code }) => {
      const capabilities = this.capabilities();
      let available = 'no' as AICapabilityAvailability;
      if (capabilities && 'languageAvailable' in capabilities) {
        available = (capabilities as any).languageAvailable(code) || 'no';
      }
      return {
        code,
        name: this.service.languageTagToHumanReadable(code),
        available,
      }
    });
    this.languagesAvailable.set(languages);
  }

  async teardown() {
    await this.service.destroyCapabilities();
    await this.service.destroyDetector();
    const languages = this.languagesAvailable().map(({ code }) => ({
      code,
      name: this.service.languageTagToHumanReadable(code),
      available: 'no' as AICapabilityAvailability,
    }));
    this.languagesAvailable.set(languages);
  }

  async detectLanguage(topNLanguages = 3) {
    const results = await this.service.detect(this.inputText(), topNLanguages);
    this.detectedLanguages.set(results);
  }
}

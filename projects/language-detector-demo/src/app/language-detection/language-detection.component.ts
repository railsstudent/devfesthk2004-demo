import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageDetectionService } from '../ai/services/language-detection.service';
import { LanguageDetectionWithNameResult } from '../ai/types/language-detection-result.type';
import { LanguageDetectionResultComponent } from './components/language-detection-result.component';

@Component({
    selector: 'app-language-detection',
    imports: [FormsModule, LanguageDetectionResultComponent],
    template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>Language Detector API Demo</h3>
      <div>
        <span class="label" for="input">Input text: </span>
        <textarea id="input" name="input" [(ngModel)]="inputText" rows="15"></textarea>
      </div>
      <div style="display: flex;">
        <div style="margin-right: 1rem;">
          <span class="label">Input Quota: </span>
          <span class="label">{{ inputQuota() }}</span>
        </div>
        <div>
          <span class="label">Input Usage: </span>
          <span class="label">{{ usage() }}</span>
        </div>
      </div>
      <button (click)="detectLanguage()" [disabled]="this.inputText().trim() === ''">Detect Language</button>
      <app-language-detection-result [detectedLanguages]="detectedLanguages()" />
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageDetectionComponent {
  service = inject(LanguageDetectionService);
  inputText = signal('');
  detectedLanguages = signal<LanguageDetectionWithNameResult[]>([]);
  inputQuota = this.service.inputQuota;
  usage = this.service.usage;

  async detectLanguage(topNLanguages = 3) {
    const results = await this.service.detect(this.inputText(), topNLanguages);
    this.detectedLanguages.set(results);
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageDetectionService } from '../ai/services/language-detection.service';
import { LanguageDetectionWithNameResult } from '../ai/types/language-detection-result.type';
import { LanguageDetectionResultComponent } from './components/language-detection-result.component';

@Component({
    selector: 'app-language-detection',
    imports: [FormsModule, LanguageDetectionResultComponent],
    template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>Language Detection Demo</h3>
      <div>
        <span class="label" for="input">Input text: </span>
        <textarea id="input" name="input" [(ngModel)]="inputText" rows="3"></textarea>
      </div>
      <button style="margin-right: 0.5rem;" (click)="setup()">Create a detector</button>
      <button style="margin-right: 0.5rem;" (click)="teardown()">Destroy a detector</button>
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
  detector = this.service.detector;
  isDisableDetectLanguage = computed(() => !this.detector() || this.inputText().trim() === '');

  async setup() {
    await this.service.createDetector();    
  }

  teardown() {
    this.service.destroyDetector();
  }

  async detectLanguage(topNLanguages = 3) {
    const results = await this.service.detect(this.inputText(), topNLanguages);
    this.detectedLanguages.set(results);
  }
}

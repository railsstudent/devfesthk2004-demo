import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageDetectionComponent } from './components/language-detection.component';
import { AllowTranslation } from './types/allow-translation.type';
import { TranslationService } from '../ai/services/translation.service';
import { TranslateTextComponent } from './components/translate-text.component';
import { LanguagePairAvailable } from '../ai/types/language-pair.type';

@Component({
  selector: 'app-translation-container',
  standalone: true,
  imports: [FormsModule, LanguageDetectionComponent, TranslateTextComponent],
  template: `
    <div>
      <h3>Translation API Demo</h3>
      <app-language-detection (nextStep)="updateCanTranslate($event)" />
      @let inputText = sample().inputText;
      @if (sample().sourceLanguage && inputText) {
        <app-translate-text [languagePairs]="languagePairs" [inputText]="inputText" />
      } @else if (inputText) {
        <p>{{ inputText }} cannot be translated.</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslationContainerComponent {
  translationService = inject(TranslationService);
  languagePairs: LanguagePairAvailable[] = []

  sample = signal({ sourceLanguage: '', inputText: '' });

  async updateCanTranslate(allowTranslation: AllowTranslation) {
    this.languagePairs = [];
    this.sample.set({ sourceLanguage: '', inputText: '' });
    if (allowTranslation && allowTranslation.toTranslate) {
      const { code: sourceLanguage, inputText } = allowTranslation;
      this.languagePairs = await this.translationService.createLanguagePairs(sourceLanguage);
      console.log('this.languagePairs', this.languagePairs);
      this.sample.set({ sourceLanguage, inputText });
    }
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslationService } from '../ai/services/translation.service';
import { LanguagePair, LanguagePairAvailable } from '../ai/types/language-pair.type';
import { LanguageDetectionComponent } from './components/language-detection.component';
import { TranslateTextComponent } from './components/translate-text.component';
import { AllowTranslation } from './types/allow-translation.type';

@Component({
  selector: 'app-translation-container',
  standalone: true,
  imports: [LanguageDetectionComponent, TranslateTextComponent],
  template: `
    <div>
      <h3>Translation API Demo</h3>
      <app-language-detection (nextStep)="updateCanTranslate($event)" />
      @let inputText = sample().inputText;
      @if (sample().sourceLanguage && inputText) {
        <app-translate-text [languagePairs]="languagePairs()" [inputText]="inputText"
          (downloadSuccess)="downloadNewLanguage($event)" />
      } @else if (inputText) {
        <p>{{ inputText }} cannot be translated.</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslationContainerComponent {
  translationService = inject(TranslationService);
  languagePairs = signal<LanguagePairAvailable[]>([]);
  sample = signal({ sourceLanguage: '', inputText: '' });

  async updateCanTranslate(allowTranslation: AllowTranslation) {
    this.languagePairs.set([]);
    this.sample.set({ sourceLanguage: '', inputText: '' });
    if (allowTranslation && allowTranslation.toTranslate) {
      const { code: sourceLanguage, inputText } = allowTranslation;
      this.languagePairs.set(await this.translationService.createLanguagePairs(sourceLanguage));
      this.sample.set({ sourceLanguage, inputText });
    }
  }

  downloadNewLanguage(language: LanguagePairAvailable) {
    this.languagePairs.update((prev) => prev.map((item) => {
        if (item.sourceLanguage === language.sourceLanguage && 
          item.targetLanguage === language.targetLanguage) {
          return language
        }
        return item;
      })
    );
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslatorService } from '../ai/services/translator.service';
import { LanguagePair, LanguagePairAvailable } from '../ai/types/language-pair.type';
import { LanguageDetectionComponent } from './components/language-detection.component';
import { TranslateTextComponent } from './components/translate-text.component';
import { AllowTranslation } from './types/allow-translation.type';

@Component({
    selector: 'app-translation-container',
    imports: [LanguageDetectionComponent, TranslateTextComponent],
    template: `
    <div>
      <h3>Translator API Demo</h3>
      <app-language-detection (nextStep)="updateCanTranslate($event)" />
      @let inputText = vm().sample.inputText;
      @if (vm().sample.sourceLanguage && inputText) {
        <app-translate-text [vm]="vm()"
          (downloadLanguagePack)="downloadNewLanguage($event)" />
      } @else if (inputText) {
        <p>{{ inputText }} cannot be translated.</p>
      }
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslationContainerComponent {
  translationService = inject(TranslatorService);
  languagePairs = signal<LanguagePairAvailable[]>([]);
  sample = signal({ sourceLanguage: '', inputText: '' });

  vm = computed(() => ({
    usage: this.translationService.usage(),
    sample: this.sample(),
    languagePairs: this.languagePairs(),
    strError: this.translationService.strError(),
    downloadPercentage: this.translationService.downloadPercentage(),
  }));

  async updateCanTranslate(allowTranslation: AllowTranslation) {
    this.languagePairs.set([]);
    this.sample.set({ sourceLanguage: '', inputText: '' });
    if (allowTranslation?.toTranslate) {
      const { code: sourceLanguage, inputText } = allowTranslation;
      const languagePairs = await this.translationService.createLanguagePairs(sourceLanguage);
      this.languagePairs.set(languagePairs);
      this.sample.set({ sourceLanguage, inputText });
    }
  }

  async downloadNewLanguage(languagePair: LanguagePair) {
    const language = await this.translationService.downloadLanguagePackage(languagePair);
    if (language?.available === 'available') {
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
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-summarizer-container',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div>
      <h3>Summarization API Demo</h3>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummarizerContainerComponent {
  // translationService = inject(TranslationService);
  // languagePairs: LanguagePairAvailable[] = []

  // sample = signal({ sourceLanguage: '', inputText: '' });

  // async updateCanTranslate(allowTranslation: AllowTranslation) {
  //   this.languagePairs = [];
  //   this.sample.set({ sourceLanguage: '', inputText: '' });
  //   if (allowTranslation && allowTranslation.toTranslate) {
  //     const { code: sourceLanguage, inputText } = allowTranslation;
  //     this.languagePairs = await this.translationService.createLanguagePairs(sourceLanguage);
  //     console.log('this.languagePairs', this.languagePairs);
  //     this.sample.set({ sourceLanguage, inputText });
  //   }
  // }
}

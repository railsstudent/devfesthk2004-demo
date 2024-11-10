import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SummarizerCapabilitiesComponent } from './components/summarizer-capabilities.component';
import { SummarizationService } from '../ai/services/summarization.service';
import { AISummarizerFormat, AISummarizerLength, AISummarizerType } from '../ai/enums/capabilities-core-options.enum';

@Component({
  selector: 'app-summarizer-container',
  standalone: true,
  imports: [SummarizerCapabilitiesComponent],
  template: `
    <div>
      <h3>Summarization API Demo</h3>
        <app-summarizer-capabilities [supportedFormats]="supportedFormats()"
        [supportedLength]="supportedLength()"
        [supportedTypes]="supportedTypes()"
        [languageAvailable]="languageAvailable()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummarizerContainerComponent {
  translationService = inject(SummarizationService);
  supportedFormats = signal<string[]>([]);
  supportedTypes = signal<string[]>([]);
  supportedLength = signal<string[]>([]);
  languageAvailable = signal<string[]>([]);

  constructor() {
    const promisesFormat = [
      this.translationService.checkSummarizerFormat(AISummarizerFormat.PLAIN_TEXT),
      this.translationService.checkSummarizerFormat(AISummarizerFormat.MARKDOWN)
    ];

    Promise.all(promisesFormat)
      .then((results) => this.supportedFormats.set(results));

    const promisesTypes = [
      this.translationService.checkSummarizerType(AISummarizerType.HEADLINE),
      this.translationService.checkSummarizerType(AISummarizerType.KEYPOINTS),
      this.translationService.checkSummarizerType(AISummarizerType.TEASER),
      this.translationService.checkSummarizerType(AISummarizerType.TLDR),
    ];

    Promise.all(promisesTypes)
      .then((results) => this.supportedTypes.set(results));

    const promisesLength = [
      this.translationService.checkSummarizerLength(AISummarizerLength.LONG),
      this.translationService.checkSummarizerLength(AISummarizerLength.MEDIUM),
      this.translationService.checkSummarizerLength(AISummarizerLength.SHORT)
    ];
  
    Promise.all(promisesLength)
      .then((results) => this.supportedLength.set(results));

    this.translationService.languageAvailable(['en', 'es', 'zh']).then((results) => 
      this.languageAvailable.set(results)
    )

  }

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

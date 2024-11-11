import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SummarizationService } from '../ai/services/summarization.service';
import { SummarizerCapabilitiesComponent } from './components/summarizer-capabilities.component';
import { SummarizerOptionsComponent } from './components/summarizer-oprions.component';
import { SummarizerSelectOptions } from '../ai/types/summarizer-select-options.type';
import { SummarizerComponent } from './components/summarizer.component';

@Component({
  selector: 'app-summarizer-container',
  standalone: true,
  imports: [SummarizerCapabilitiesComponent, SummarizerComponent],
  template: `
    <div>
      <h3>Summarization API Demo</h3>
      <app-summarizer-capabilities [supportedFormats]="supportedFormats()"
        [supportedLength]="supportedLength()"
        [supportedTypes]="supportedTypes()"
        [languageAvailable]="languageAvailable()"
      />
      <app-summarizer [selectOptions]="selectOptions()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummarizerContainerComponent {
  summarizationService = inject(SummarizationService);
  supportedFormats = signal<string[]>([]);
  supportedTypes = signal<string[]>([]);
  supportedLength = signal<string[]>([]);
  languageAvailable = signal<string[]>([]);
  selectOptions = signal<SummarizerSelectOptions>({
    formatValues: [],
    lengthValues: [],
    typeValues: [],
  });

  constructor() {
    Promise.all([
      this.summarizationService.checkSummarizerFormats(),
      this.summarizationService.checkSummarizerTypes(),
      this.summarizationService.checkSummarizerLengths()
    ]).then(([ formats, types, lengths]) => {
      this.supportedFormats.set(formats)
      this.supportedTypes.set(types);
      this.supportedLength.set(lengths);
    });

    this.summarizationService.languageAvailable(['en', 'zh']).then((results) => 
      this.languageAvailable.set(results)
    )

    this.summarizationService.populateSelectOptions()
      .then((result) => this.selectOptions.set(result));
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SummarizationService } from '../ai/services/summarization.service';
import { SummarizerSelectOptions } from '../ai/types/summarizer-select-options.type';
import { SummarizerComponent } from './components/summarizer.component';

@Component({
    selector: 'app-summarizer-container',
    imports: [SummarizerComponent],
    template: `
    <div>
      <h3>Summarization API Demo</h3>
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
    this.summarizationService.languageAvailable(['en', 'zh']).then((results) => 
      this.languageAvailable.set(results)
    )

    this.summarizationService.populateSelectOptions()
      .then((result) => this.selectOptions.set(result));
  }
}

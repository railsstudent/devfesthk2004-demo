import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SummarizationService } from '../ai/services/summarization.service';
import { SummarizerSelectOptions } from '../ai/types/summarizer-select-options.type';
import { SummarizerComponent } from './components/summarizer.component';
import { formats } from '../ai/constants/summarizer-format-list.constant';
import { lengths } from '../ai/constants/summarizer-length-list.constant';
import { types } from '../ai/constants/summarizer.-type-list.constant';

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
  selectOptions = signal<SummarizerSelectOptions>({
    formats,
    lengths,
    types,
  });
}

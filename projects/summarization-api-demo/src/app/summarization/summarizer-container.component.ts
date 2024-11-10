import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AISummarizerFormat, AISummarizerLength, AISummarizerType } from '../ai/enums/capabilities-core-options.enum';
import { SummarizationService } from '../ai/services/summarization.service';
import { SummarizerCapabilitiesComponent } from './components/summarizer-capabilities.component';

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
  summarizationService = inject(SummarizationService);
  supportedFormats = signal<string[]>([]);
  supportedTypes = signal<string[]>([]);
  supportedLength = signal<string[]>([]);
  languageAvailable = signal<string[]>([]);

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
  }
}

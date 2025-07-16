import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SummarizationService } from '../../ai/services/summarization.service';
import { SummarizerSelectOptions } from '../../ai/types/summarizer-select-options.type';
import { SummarizerOptionsComponent } from './summarizer-options.component';
import { SummaryComponent } from './summary.component';

@Component({
    selector: 'app-summarizer',
    imports: [FormsModule, SummarizerOptionsComponent, SummaryComponent],
    template: `
    <app-summarizer-options [selectOptions]="selectOptions()"
      [(selectedFormat)]="selectedFormat" [(selectedType)]="selectedType" [(selectedLength)]="selectedLength"
      [availability]="availability()"
    />
    @if (error()) {
      <p>Error: {{ error() }}</p>
      <hr />
    } 
    <label for="sharedContext">Shared Context:</label>
    <input id="sharedContext" name="sharedContext" [(ngModel)]="sharedContext" />
    <app-summary (getSummary)="generateSummary($event)"
      [chunks]="chunks()"
      [chunk]="chunk()"
      [isSummarizing]="isSummarizing()"
    />
  `,
    styles: `
    input {
      width: 100%;
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummarizerComponent {
  summarizationService = inject(SummarizationService);
  selectOptions = input.required<SummarizerSelectOptions>();

  formatOptions = computed(() => this.selectOptions().formats);
  typeOptions = computed(() => this.selectOptions().types);
  lengthOptions = computed(() => this.selectOptions().lengths);

  selectedFormat = linkedSignal({
    source: this.formatOptions,
    computation: (source) =>  source.find((item) => item === 'markdown') || source[0]
  });

  selectedType = linkedSignal({
    source: this.typeOptions,
    computation: (source) => source.find((item) => item === 'key-points') || source[0]
  });
  
  selectedLength = linkedSignal({
    source: this.lengthOptions,
    computation: (source) => source.find((item) => item === 'medium') || source[0]
  });

  sharedContext = signal('Generate a summary of book description from https://www.packtpub.com/');

  summarizerCreateOptions = computed<SummarizerCreateCoreOptions>(() => {
    return {
      format: this.selectedFormat(),
      type: this.selectedType(),
      length: this.selectedLength(),
      sharedContext: this.sharedContext(),
      expectedContextLanguages: ['en-US'],
      expectedInputLanguages: ['en-US'],
      outputLanguage: 'en-US',
    }
  });

  error = this.summarizationService.error;
  availability = this.summarizationService.availability;
  isSummarizing = this.summarizationService.isSummarizing;
  chunk = this.summarizationService.chunk;
  chunks = this.summarizationService.chunks;
  
  async generateSummary(text: string) {
    await this.summarizationService.summarizeStream(this.summarizerCreateOptions(), text);
  }
}

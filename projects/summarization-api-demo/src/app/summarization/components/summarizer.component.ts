import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SummarizationService } from '../../ai/services/summarization.service';
import { SummarizerSelectOptions } from '../../ai/types/summarizer-select-options.type';
import { LineBreakPipe } from '../pipes/line-break.pipe';
import { SummarizerOptionsComponent } from './summarizer-options.component';
import data from '../data/description.json';

@Component({
    selector: 'app-summarizer',
    imports: [FormsModule, SummarizerOptionsComponent, LineBreakPipe],
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
    <label for="content">Content:</label>
    <textarea id="content" name="content" rows="10" [(ngModel)]="text"></textarea>
    <label for="content">Content 2:</label>
    <textarea id="content2" name="content2" rows="10" [(ngModel)]="text2"></textarea>
    <div>
      @let buttonText = isSummarizing() ? 'Summarizing...' : 'Summarize';
      @let disabled = text().trim() === '' || text2().trim() === '' || isSummarizing();
      <button (click)="generateSummaries()" [disabled]="disabled">{{ buttonText }}</button>
    </div>
    @if (!error()) {
      @for (content of summaries(); track $index) {
        <p>Summary {{$index + 1}}</p>
        <div [innerHTML]="content | lineBreak"></div>
      }
    }
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
  });;
  
  selectedLength = linkedSignal({
    source: this.lengthOptions,
    computation: (source) => source.find((item) => item === 'medium') || source[0]
  });

  sharedContext = signal('Generate a summary of book description from https://www.packtpub.com/');
  text = signal(data.cicd);
  text2 = signal(data.llm);
  isSummarizing = signal(false);

  summarizerCreateOptions = computed(() => {
    return {
      format: this.selectedFormat(),
      type: this.selectedType(),
      length: this.selectedLength(),
      sharedContext: this.sharedContext(),
      expectedInputLanguages: ['en-US'],
      outputLanguage: 'en-US',
    }
  });

  summaries = this.summarizationService.summaries;
  error = this.summarizationService.error;
  availability = this.summarizationService.availability;

  async generateSummaries() {
    try {
      this.isSummarizing.set(true);
      const texts = [this.text().trim(), this.text2().trim()];
      await this.summarizationService.summarize(this.summarizerCreateOptions(), this.text().trim(), this.text2().trim());
    } finally {
      this.isSummarizing.set(false);
    }
  }
}

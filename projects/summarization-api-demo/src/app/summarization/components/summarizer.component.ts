import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SummarizationService } from '../../ai/services/summarization.service';
import { SummarizerSelectOptions } from '../../ai/types/summarizer-select-options.type';
import data from '../data/description.json';
import { SummarizerOptionsComponent } from './summarizer-options.component';
import { SummaryComponent } from './summary.component';

const findDefault = <T>(options: T[], defaultValue: T) => 
  options.find((item) => item ===  defaultValue) || options[0]

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
    <app-summary [options]="summarizerCreateOptions()" [content]="text()" />
    <app-summary [options]="summarizerCreateOptions()" [content]="text2()" />
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

  text = signal(data.cicd);
  text2 = signal(data.llm);
  sharedContext = signal('Generate a summary of book description from https://www.packtpub.com/');

  selectedFormat = linkedSignal(() => findDefault(this.selectOptions().formats, 'markdown'));
  selectedType = linkedSignal(() => findDefault(this.selectOptions().types, 'key-points'));
  selectedLength = linkedSignal(() => findDefault(this.selectOptions().lengths, 'medium'));

  outputStyles = computed(() => ({
    type: this.selectedType(),
    format: this.selectedFormat(),
    length: this.selectedLength(),
  }));

  summarizerCreateOptions = computed<SummarizerCreateCoreOptions>(() => {
    return {
      ...this.outputStyles(),
      sharedContext: this.sharedContext(),
      expectedContextLanguages: ['en-US'],
      expectedInputLanguages: ['en-US'],
      outputLanguage: 'en-US',
    }
  });

  availabilityResource = resource({
    params: () => this.outputStyles(),
    loader: ({ params }) => this.summarizationService.checkAvailability(params)
  });

  error = this.summarizationService.error;
  availability = computed(() =>  this.availabilityResource.hasValue() ? this.availabilityResource.value() : false);
}

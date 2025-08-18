import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SummarizationService } from '../../ai/services/summarization.service';
import { Mode } from '../../ai/types/summarizer-mode.type';
import { SummarizerSelectOptions } from '../../ai/types/summarizer-select-options.type';
import data from '../data/description.json';
import { StreamSummaryComponent } from './stream-summary.component';
import { SummarizerOptionsComponent } from './summarizer-options.component';
import { SummaryComponent } from './summary.component';

const findDefault = <T>(options: T[], defaultValue: T) => 
  options.find((item) => item ===  defaultValue) || options[0]

@Component({
    selector: 'app-summarizer',
    imports: [FormsModule, SummarizerOptionsComponent, NgComponentOutlet],
    template: `
    <app-summarizer-options [selectOptions]="selectOptions()"
      [(selectedFormat)]="selectedFormat" [(selectedType)]="selectedType" [(selectedLength)]="selectedLength"
      [availability]="availability()" [(selectedMode)]="selectedMode"
    />
    @if (error()) {
      <p>Error: {{ error() }}</p>
      <hr />
    } 
    <label for="sharedContext">Shared Context:</label>
    <input id="sharedContext" name="sharedContext" [(ngModel)]="sharedContext" />
    @let options = {
      options: summarizerCreateOptions(),
      content: this.text(),
    };

    <ng-container [ngComponentOutlet]="getComponentType()" 
      [ngComponentOutletInputs]="options"
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

  text = signal(data.cicd);
  sharedContext = signal('Generate a summary of book description from https://www.packtpub.com/');

  selectedFormat = linkedSignal(() => findDefault(this.selectOptions().formats, 'markdown'));
  selectedType = linkedSignal(() => findDefault(this.selectOptions().types, 'key-points'));
  selectedLength = linkedSignal(() => findDefault(this.selectOptions().lengths, 'medium'));
  selectedMode = signal<Mode>('batch');

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

  getComponentType() {
    return this.selectedMode() === 'streaming' ? StreamSummaryComponent : SummaryComponent;
  }
}

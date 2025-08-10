import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, inject, input, inputBinding, linkedSignal, OnDestroy, resource, signal, twoWayBinding, Type, viewChild, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SummarizationService } from '../../ai/services/summarization.service';
import { Mode } from '../../ai/types/summarizer-mode.type';
import { SummarizerSelectOptions } from '../../ai/types/summarizer-select-options.type';
import data from '../data/description.json';
import { SummarizerOptionsComponent } from './summarizer-options.component';

const findDefault = <T>(options: T[], defaultValue: T) => 
  options.find((item) => item ===  defaultValue) || options[0]

@Component({
    selector: 'app-summarizer',
    imports: [FormsModule, SummarizerOptionsComponent],
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
    <ng-container #vcr />
  `,
    styles: `
    input {
      width: 100%;
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummarizerComponent implements OnDestroy {
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

  vcr = viewChild.required('vcr', { read: ViewContainerRef });

  private async getComponentType(): Promise<Type<any>> {
    if (this.selectedMode() === 'streaming') {
      const { StreamSummaryComponent } = await import('./stream-summary.component');
      return StreamSummaryComponent;
    }

    const { SummaryComponent } = await import('./summary.component');
    return SummaryComponent;
  }

  constructor() {
    afterRenderEffect({
      write: async () => { 
        const vcr = this.vcr();
        vcr.clear();
        const componentType = await this.getComponentType();
        vcr.createComponent(componentType, {
          bindings: [
            inputBinding('options', () => this.summarizerCreateOptions()),
            twoWayBinding('content', this.text),
          ]
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.vcr().clear();
  }
}

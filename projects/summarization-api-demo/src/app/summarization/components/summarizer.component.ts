import { ChangeDetectionStrategy, Component, computed, effect, input, linkedSignal, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SummarizerSelectOptions } from '../../ai/types/summarizer-select-options.type';
import { SummarizerOptionsComponent } from './summarizer-oprions.component';

@Component({
  selector: 'app-summarizer',
  standalone: true,
  imports: [FormsModule, SummarizerOptionsComponent],
  template: `
    <app-summarizer-options [selectOptions]="selectOptions()"
      [(selectedFormat)]="selectedFormat" [(selectedType)]="selectedType" [(selectedLength)]="selectedLength"
    />
    <div>
      {{ selectedFormat() }}, {{ selectedType() }}, {{ selectedLength() }}
    </div>
    <label for="content">Content:</label>
    <textarea id="content" name="content"></textarea>

    <label for="content">Content:</label>
    <textarea id="content" name="content"></textarea>
    <div>
      <button>Summarize</button>
    </div>
    <label for="summary">Summary:</label>
    <textarea id="summary" name="summary"></textarea>
  `,
  styles: `
    .options-container {
      display: flex;
      flex-wrap: wrap;
    }

    .options-container > div {
      flex-basis: 16.66%; 
      margin-bottom: 1rem;
    }

    .options-container > div > p {
      line-height: 1.25rem;
    }

    h4 {
      text-decoration: underline; 
      font-style: italic;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummarizerComponent {
    selectOptions = input.required<SummarizerSelectOptions>();

    formatOptions = computed(() => this.selectOptions().formatValues);
    typeOptions = computed(() => this.selectOptions().typeValues);
    lengthOptions = computed(() => this.selectOptions().lengthValues);

    selectedFormat = linkedSignal({
      source: this.formatOptions,
      computation: (source) => source[0]
    });

    selectedType = linkedSignal({
      source: this.typeOptions,
      computation: (source) => source[0]
    });;
    
    selectedLength = linkedSignal({
      source: this.lengthOptions,
      computation: (source) => source[0]
    });

    summarizerCreateOptions = computed(() => {
      return {
        format: this.selectedFormat(),
        type: this.selectedType(),
        length: this.lengthOptions(),
        sharedContext: this.sharedContext(),
      }
    });

    sharedContext = signal('A blog post from langchain blog site, https://blog.langchain.dev/.');
}

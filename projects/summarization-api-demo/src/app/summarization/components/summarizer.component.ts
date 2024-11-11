import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, signal } from '@angular/core';
import { SummarizerSelectOptions } from '../../ai/types/summarizer-select-options.type';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-summarizer',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container">
        @if (formatOptions().length > 0 && typeOptions().length > 0 && lengthOptions().length > 0) {
            <select [(ngModel)]="selectedFormat">
                @for (value of formatOptions(); track value) {
                    <option [ngValue]="value">{{ value }}</option>
                }
            </select>

            <select [(ngModel)]="selectedType">
                @for (value of typeOptions(); track value) {
                    <option [ngValue]="value">{{ value }}</option>
                }
            </select>

            <select [(ngModel)]="selectedLength">
                @for (value of lengthOptions(); track value) {
                    <option [ngValue]="value">{{ value }}</option>
                }
            </select>

            {{ selectedFormat() }},
            {{ selectedType() }}, 
            {{ selectedLength() }}
        }
    </div>
    <hr />
  `,
  styles: `
    .container {
      display: flex;
      flex-wrap: wrap;
    }

    .container > div {
      flex-basis: 33.33%; 
      flex-grow: 1; 
      flex-shrink: 1;
    }

    .container > div > p {
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
        computation: (source) => source[0],
    });

    selectedType = linkedSignal({
        source: this.typeOptions,
        computation: (source) => source[0],
    });

    selectedLength = linkedSignal({
        source: this.lengthOptions,
        computation: (source) => source[0],
    });

    sharedContext = signal('A blog post from langchain blog site, https://blog.langchain.dev/.');
}

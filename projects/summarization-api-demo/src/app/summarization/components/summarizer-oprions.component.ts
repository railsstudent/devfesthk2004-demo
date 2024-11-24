import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SummarizerSelectOptions } from '../../ai/types/summarizer-select-options.type';

@Component({
    selector: 'app-summarizer-options',
    imports: [FormsModule],
    template: `
    <div class="options-container">
      @let formatOptions = selectOptions().formatValues;
      @let typeOptions = selectOptions().typeValues;
      @let lengthOptions = selectOptions().lengthValues;
      @if (formatOptions.length > 0 && typeOptions.length > 0 && lengthOptions.length > 0) {
        <div>
          <label for="format">Format: </label>
          <select name="format" id="format" [(ngModel)]="selectedFormat">
              @for (value of formatOptions; track value) {
                <option [ngValue]="value">{{ value }}</option>
              }
          </select>
        </div>
        <div>
          <label for="type">Type: </label>
          <select name="type" id="type" [(ngModel)]="selectedType">
            @for (value of typeOptions; track value) {
              <option [ngValue]="value">{{ value }}</option>
            }
          </select>
        </div>
        <div>
          <label for="length">Length: </label>
          <select name="length" id="length" [(ngModel)]="selectedLength">
            @for (value of lengthOptions; track value) {
              <option [ngValue]="value">{{ value }}</option>
            }
          </select>
        </div>
      }
    </div>
    <hr />
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
export class SummarizerOptionsComponent {
    selectOptions = input.required<SummarizerSelectOptions>();

    selectedFormat = model.required<string>();
    selectedType = model.required<string>();
    selectedLength = model.required<string>();
}

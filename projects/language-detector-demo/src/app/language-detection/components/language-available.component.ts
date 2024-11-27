import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LanguageAvailable } from '../../ai/types/language-available.type';

@Component({
  selector: 'app-language-available',
  standalone: true,
  template: `
    <div style="display: flex; flex-wrap: wrap;">
    @for (language of languagesAvailable(); track language.code) {
        <p style="flex-basis: calc(100% / 3); flex-shrink: 1;">
          Is {{ language.name }} available? {{language.available }}
        </p>
    }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageAvailabledComponent {
    languagesAvailable = input<LanguageAvailable[]>([]);
}

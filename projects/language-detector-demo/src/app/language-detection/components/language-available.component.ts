import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LanguageAvailable } from '../../ai/types/language-available.type';

@Component({
  selector: 'app-language-available',
  standalone: true,
  template: `
    <div>
    @for (language of languagesAvailable(); track language.code) {
        <p>Is {{ language.name }} available? {{language.available }}</p>
    }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageAvailabledComponent {
    languagesAvailable = input<LanguageAvailable[]>([]);
}

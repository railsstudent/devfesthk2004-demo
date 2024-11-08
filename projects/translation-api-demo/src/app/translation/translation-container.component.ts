import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageDetectionComponent } from './components/language-detection.component';

@Component({
  selector: 'app-translation-container',
  standalone: true,
  imports: [FormsModule, LanguageDetectionComponent],
  template: `
    <div>
      <h3>Translation API Demo</h3>
      <app-language-detection />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslationContainerComponent {}

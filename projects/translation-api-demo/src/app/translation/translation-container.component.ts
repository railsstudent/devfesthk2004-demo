import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageDetectionComponent } from './components/language-detection.component';
import { AllowTranslation } from './types/allow-translation.type';

@Component({
  selector: 'app-translation-container',
  standalone: true,
  imports: [FormsModule, LanguageDetectionComponent],
  template: `
    <div>
      <h3>Translation API Demo</h3>
      <app-language-detection (nextStep)="updateCanTranslate($event)" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslationContainerComponent {
  
  updateCanTranslate(value: AllowTranslation) {

  }
}

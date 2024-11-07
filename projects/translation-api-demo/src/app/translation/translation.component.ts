import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-translation',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div>testing</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslationComponent {}

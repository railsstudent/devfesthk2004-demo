import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-feedback-error',
  standalone: true,
  template: `
    @if (error()) {
        <div>
          <span class="label">Error: </span>
          <p>{{ error() }}</p>
        </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorComponent {
    error = input('');
}

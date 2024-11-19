import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-feedback-loading',
  standalone: true,
  template: `
    @if (isLoading()) {
      <div>
        <span class="label">Status: </span>
        <span><ng-content>Loading...</ng-content></span>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackLoadingComponent {
  isLoading = input(false);
}

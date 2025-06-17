import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-setup',
  standalone: true,
  template: `
    <p>Explainer: <a [href]="explainer" target="_blank">{{ explainer }}</a></p>
    <p>Expect breaking changess because the Explainer markdown has newer API than my browser.</p>
    <p>You will need Version {{ minimumVersion }} or above.</p>
    <h3>Setup</h3>
    <ol style="margin-left: 1rem; color: black;">
        @for (step of steps(); track $index) {
            <li style="line-height: 1.25rem;">{{ step }}</li>
        }
    </ol>
    <hr />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetupComponent {
  explainer = 'https://developer.mozilla.org/en-US/docs/Web/API/Summarizer_API/Using';
  minimumVersion = '136'

  steps = signal([
    'Open new tab, go to chrome://flags/#summarization-api-for-gemini-nano.',
    'Select Enabled.',
    'Relaunch Chrome',
    'Open new tab, go to chrome://components.',
    'Find Optimization Guide On Device Model',
    'Click "Check for update" button to download the model. Version number should update.',
  ]);
}

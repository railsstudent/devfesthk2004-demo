import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-setup',
  standalone: true,
  template: `
    <p>Explainer: <a [href]="explainer" target="_blank">{{ explainer }}</a>
    </p>
    <p>You will need Version {{ chromeVersion() }} or above.</p>
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
  readonly explainer = 'https://github.com/explainers-by-googlers/prompt-api'  
  steps = signal([
    'Open new tab, go to chrome://flags/#optimization-guide-on-device-model.',
    'Select Enabled BypassPerRequirement.',
    'go to chrome://flags/#prompt-api-for-gemini-nano.',
    'Select Enabled.',
    '(Local development) go to chrome://flags/#text-safety-classifier',
    '(Local development) Select Disabled',
    'Relaunch Chrome',
    'Open new tab, go to chrome://components.',
    'Find Optimization Guide On Device Model',
    'Click "Check for update" button to download the model. Version number should update.',
  ]);

  chromeVersion = signal('136');
}

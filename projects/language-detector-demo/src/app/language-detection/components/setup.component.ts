import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-setup',
  standalone: true,
  template: `
    <p>Explainer: <a [href]="explainer" target="_blank">{{explainer}}</a></p>
    <p>You will need Version {{minimumVersion}} or above.</p>
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
  explainer = 'https://developer.mozilla.org/en-US/docs/Web/API/Translator_and_Language_Detector_APIs';
  minimumVersion = 136
  steps = signal([
    'Open a new tab in Chrome, go to chrome://flags/#language-detection-api.',
    'Select Enabled.',
    'Relaunch Chrome',
  ]);
}

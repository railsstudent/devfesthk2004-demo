import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-setup',
  standalone: true,
  template: `
    <p>Explainer: <a href="https://github.com/WICG/translation-api?tab=readme-ov-file#language-detection" target="_blank">
    https://github.com/WICG/translation-api?tab=readme-ov-file#language-detection</a>
    </p>
    <p>You will need Version 136 or above.</p>
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
    steps = signal([
        'Open a new tab in Chrome, go to chrome://flags/#language-detection-api.',
        'Select Enabled.',
        'Relaunch Chrome',
    ]);
}

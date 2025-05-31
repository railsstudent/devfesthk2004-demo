import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-setup',
  template: `
    <p>Explainer: <a [href]="explainer" target="_blank">{{ explainer }}</a>
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
  explainer = 'https://developer.mozilla.org/en-US/docs/Web/API/Translator_and_Language_Detector_APIs';
  minimumVersion = '136'

  steps = signal([
    'Open new tab, go to chrome://flags/#translation-api.',
    'Select Enabled. If you want to try many language pairs, select Enabled without language pack limit.',
    'Relaunch Chrome',
    'Open new tab, go to chrome://components.',
    'Find Chrome TranslateKit',
    'Click "Check for update" button to download the language model. Version number should update.',
    '(Optional) Open new tab, go to chrome://on-device-translation-internals/',
    '(Optional) Install language pairs.'
  ]);
}

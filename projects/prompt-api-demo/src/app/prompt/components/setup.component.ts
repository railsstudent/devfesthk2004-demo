import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AbstractPromptService } from '../../ai/services/abstract-prompt.service';
import { NShotsPromptService } from '../../ai/services/n-shots-prompt.service';
import { BasePromptComponent } from './base-prompt.component';
import { LanguageInitialPrompt } from '../../ai/types/language-initial-prompt.type';
import { AILanguageModelInitialPromptRole } from '../../ai/enums/initial-prompt-role.enum';
import { FormsModule } from '@angular/forms';
import { TokenizationComponent } from './tokenization.component';
import { InitialPromptComponent } from './initial-prompt.component';

@Component({
  selector: 'app-setup',
  standalone: true,
  template: `
    <p>Explainer: <a href="https://github.com/explainers-by-googlers/prompt-api" target="_blank">
      https://github.com/explainers-by-googlers/prompt-api</a>
    </p>
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
        'Open new tab, go to chrome://flags/#optimization-guide-on-device-model.',
        'Select Enabled BypassPerRequirement.',
        'go to chrome://flags/#prompt-api-for-gemini-nano.',
        'Select Enabled.',
        'Relaunch Chrome',
        'Open new tab, go to chrome://components.',
        'Find Optimization Guide On Device Model',
        'Click "Check for update" button to download the model. Version number should update.',
    ]);
}

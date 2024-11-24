import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LanguageInitialPrompt } from '../../ai/types/prompt.type';

@Component({
    selector: 'app-initial-prompt',
    imports: [],
    template: `
    <div>
        <h3 style="text-decoration: underline;">Initial Prompts</h3>
        @for (initialPrompt of initialPrompts(); track $index) {
            <p><span class="label">{{ initialPrompt.role }}: </span>
              <span>{{ initialPrompt.content }}</span>
            </p>
        }
        <hr/>
    </div>
  `,
    styleUrl: './prompt.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InitialPromptComponent {
    initialPrompts = input<LanguageInitialPrompt>([]);
}

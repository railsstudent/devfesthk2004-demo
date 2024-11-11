import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Tokenization } from '../../ai/types/prompt.type';
import { LanguageInitialPrompt } from '../../ai/types/language-initial-prompt.type';

@Component({
  selector: 'app-initial-prompt',
  standalone: true,
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
    initialPrompts = input<LanguageInitialPrompt[]>([]);
}

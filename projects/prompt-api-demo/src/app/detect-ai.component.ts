import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserAgentComponent } from './ai/user-agent.component';
import { isPromptAPISupported } from './ai/utils/ai-detection';
import { PromptShowcaseComponent } from './prompt/prompt-showcase.component';

@Component({
  selector: 'app-detect-ai',
  standalone: true,
  imports: [PromptShowcaseComponent, UserAgentComponent],
  template: `
    @if (showUserAgent()) {
      <app-user-agent />
    }
    <div>
      @let error = hasCapability();
      @if (!error) {
        <app-prompt-showcase />
      } @else if (error !== 'unknown') {
        {{ error }}
      } @else {
        <p>If you're on Chrome, join the <a href="https://developer.chrome.com/docs/ai/built-in#get_an_early_preview" target="_blank">
          Early Preview Program</a> to enable it.
        </p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetectAIComponent {
  showUserAgent = input(false);
  hasCapability = toSignal(isPromptAPISupported(), { initialValue: '' });
}

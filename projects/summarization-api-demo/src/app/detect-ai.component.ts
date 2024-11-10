import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserAgentComponent } from './ai/user-agent.component';
import { isSummarizationAPISupported } from './ai/utils/ai-detection';

@Component({
  selector: 'app-detect-ai',
  standalone: true,
  imports: [UserAgentComponent],
  template: `
    @if (showUserAgent()) {
      <app-user-agent />
    }
    <div>
      @let error = hasCapability();
      @if (!error) {
        <p>Another demo: <a [href]="officialDemo" target="_blank">{{ officialDemo }}</a></p>
        <!-- app-translation-container -->
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
  officialDemo = 'https://chrome.dev/web-ai-demos/summarization-api-playground/';
  showUserAgent = input(true);
  hasCapability = toSignal(isSummarizationAPISupported(), { initialValue: '' });
}

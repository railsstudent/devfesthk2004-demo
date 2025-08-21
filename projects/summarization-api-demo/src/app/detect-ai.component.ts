import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserAgentComponent } from './ai/user-agent.component';
import { isSummarizationAPISupported } from './ai/utils/ai-detection';
import { SummarizerContainerComponent } from './summarization/summarizer-container.component';

@Component({
    selector: 'app-detect-ai',
    imports: [UserAgentComponent, SummarizerContainerComponent],
    template: `
    @if (showUserAgent()) {
      <app-user-agent />
    }
    <div>
      @let error = hasCapability();
      @if (!error) {
        <p>Another demo: <a [href]="officialDemo" target="_blank">{{ officialDemo }}</a></p>
        <app-summarizer-container />
      } @else if (error !== 'unknown') {
        {{ error }}
      } @else {
        <p>Unknown error occurred</p>
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

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserAgentComponent } from './ai/user-agent.component';
import { isTranslationApiSupported } from './ai/utils/ai-detection';
import { TranslationContainerComponent } from './translation/translation-container.component';

@Component({
    selector: 'app-detect-ai',
    imports: [TranslationContainerComponent, UserAgentComponent],
    template: `
    @if (showUserAgent()) {
      <app-user-agent />
    }
    <div>
      @let error = hasCapability();
      @if (!error) {
        <p>Another demo: <a [href]="glitchDemo" target="_blank">{{ glitchDemo }}</a></p>
        <app-translation-container />
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
  glitchDemo = 'https://translation-demo.glitch.me/';
  showUserAgent = input(false);
  hasCapability = toSignal(isTranslationApiSupported(), { initialValue: '' });
}

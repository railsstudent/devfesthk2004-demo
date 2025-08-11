import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Tokenization } from '../../ai/types/prompt.type';
import { PromptResponse } from '../types/prompt-response.type';

@Component({
    selector: 'app-tokenization',
    template: `
    <div style="display: flex;">
      <p style="margin-right: 1rem;">
        <span class="label">Number of Prompt tokens: </span><span>{{ state().numPromptTokens }}</span>
      </p>
      <p style="margin-right: 1rem;">
        <span class="label">Tokens: </span><span>{{ tokenStr() }}</span>
      </p>
      <div> 
        <span class="label">Status: </span><span>{{ state().status }}</span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokenizationComponent {
  state = input.required<PromptResponse>();

  tokenStr = computed(() => {
    const tokenContext = this.state().tokenContext;
    if (!tokenContext) {
      return 'Token information is unavailable.'
    }
    const { tokensSoFar, maxTokens, tokensLeft } = tokenContext;
    return `${tokensSoFar} / ${maxTokens} (${tokensLeft} left)`
  })
}

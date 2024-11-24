import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Tokenization } from '../../ai/types/prompt.type';

@Component({
    selector: 'app-tokenization',
    imports: [],
    template: `
    <div>
      <p><span class="label">Number of Prompt tokens: </span><span>{{ numTokens() }}</span></p>
      <p><span class="label">Tokens: </span><span>{{ tokenStr() }}</span></p>
    </div>
  `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokenizationComponent {
  numTokens = input.required<number>({ alias: 'numPromptTokens' });
  tokenContext = input.required<Tokenization | null>();

  tokenStr = computed(() => {
    const tokenContext = this.tokenContext();
    if (!tokenContext) {
      return 'Token information is unavailable.'
    }
    return `${tokenContext.tokensSoFar} / ${tokenContext.maxTokens} (${tokenContext.tokensLeft} left)`
  })
}

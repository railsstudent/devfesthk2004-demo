import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-tokenization',
  standalone: true,
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
  tokenContext = input.required<{
    tokensSoFar: number,
    maxTokens: number,
    tokensLeft: number,
  }>();

  tokenStr = computed(() => {
    const tokenContext = this.tokenContext();
    return `${tokenContext.tokensSoFar} / ${tokenContext.maxTokens} (${tokenContext.tokensLeft} left)`
  })
}

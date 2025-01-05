import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AbstractPromptService } from '../../ai/services/abstract-prompt.service';
import { NShotsPromptService } from '../../ai/services/n-shots-prompt.service';
import { LanguageInitialPrompt } from '../../ai/types/prompt.type';
import { LineBreakPipe } from '../pipes/line-break.pipe';
import { BasePromptComponent } from './base-prompt.component';
import { InitialPromptComponent } from './initial-prompt.component';
import { TokenizationComponent } from './tokenization.component';

@Component({
    selector: 'app-n-shot-prompt',
    imports: [FormsModule, TokenizationComponent, InitialPromptComponent, LineBreakPipe],
    template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>N-shots prompting</h3>
      <app-initial-prompt [initialPrompts]="initialPrompts()" />      
      <app-tokenization [numPromptTokens]="numPromptTokens()" [tokenContext]="tokenContext()" />
      @let myState = state();
      <div>
        <span class="label">Status: </span><span>{{ myState.status }}</span>
      </div>
      <div>
        <span class="label" for="input">Prompt: </span>
        <textarea id="input" name="input" [(ngModel)]="query" [disabled]="myState.disabled" rows="3"></textarea>
      </div>
      <button (click)="countPromptTokens()" [disabled]="myState.numTokensDisabled">Count Prompt Tokens</button>
      <button (click)="submitPrompt()" [disabled]="myState.submitDisabled">{{ myState.text }}</button>
      <div>
        <span class="label">Response: </span>
        <p [innerHTML]="response() | lineBreak"></p>
      </div>
      @if (error()) {
        <div>
          <span class="label">Error: </span>
          <p>{{ error() }}</p>
        </div>
      }
    </div>
  `,
    styleUrl: './prompt.component.css',
    providers: [
        {
            provide: AbstractPromptService,
            useClass: NShotsPromptService,
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NShotPromptComponent extends BasePromptComponent {
  initialPrompts = signal<LanguageInitialPrompt>([
    { role: 'system', content: `You are an expert in determine the sentiment of a text. 
    If it is positive, say 'positive'. If it is negative, say 'negative'. If you are not sure, then say 'not sure'` },
    { role: 'user', content: "The food is affordable and delicious, and the venue is close to the train station." },
    { role: 'assistant', content: "positive" },
    { role: 'user', content: "The waiters are very rude, the food is salty, and the drinks are sour." },
    { role: 'assistant', content: "negative" },
    { role: 'user', content: "Google is a comany" },
    { role: 'assistant', content: "not sure" },
    { role: 'user', content: "The weather is hot and sunny today." },
    { role: 'assistant', content: "postive" }
  ]);
  tokenContext = this.promptService.tokenContext;

  constructor() {
    super();
    this.query.set('The toilet has no toilet papers again.');
    this.promptService.setPromptOptions({ initialPrompts: this.initialPrompts() });
  }
}

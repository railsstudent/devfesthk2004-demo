import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AbstractPromptService } from '../../ai/services/abstract-prompt.service';
import { NShotsPromptService } from '../../ai/services/n-shots-prompt.service';
import { LanguageInitialPrompt } from '../../ai/types/prompt.type';
import { PromptResponse } from '../types/prompt-response.type';
import { BasePromptComponent } from './base-prompt.component';
import { InitialPromptComponent } from './initial-prompt.component';
import { PromptResponseComponent } from './prompt-response.component';

const INITIAL_PROMPTS: LanguageInitialPrompt = [
  { role: 'system', content: `You are an expert in determine the sentiment of a text. 
  If it is positive, say 'positive'. If it is negative, say 'negative'. If you are not sure, then say 'not sure'` },
  { role: 'user', content: "The food is affordable and delicious, and the venue is close to the train station." },
  { role: 'assistant', content: "positive" },
  { role: 'user', content: "The waiters are very rude, the food is salty, and the drinks are sour." },
  { role: 'assistant', content: "negative" },
  { role: 'user', content: "Google is a company" },
  { role: 'assistant', content: "not sure" },
  { role: 'user', content: "The weather is hot and sunny today." },
  { role: 'assistant', content: "postive" }
]
@Component({
  selector: 'app-n-shot-prompt',
  imports: [FormsModule, InitialPromptComponent, PromptResponseComponent],
  template: `
  <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
    <h3>N-shots prompting</h3>
    <app-initial-prompt [initialPrompts]="initialPrompts()" /> 
    <app-prompt-response [state]="responseState()" 
      [(query)]="query" 
      (countPromptTokens)="this.countPromptTokens()"
      (submitPrompt)="this.submitPrompt()"
    />
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
export class NShotsPromptComponent extends BasePromptComponent {
  initialPrompts = signal(INITIAL_PROMPTS);
  tokenContext = this.promptService.tokenContext;

  responseState = computed<PromptResponse>(() => ({
    ...this.state(),
    numPromptTokens: this.numPromptTokens(),
    tokenContext: this.tokenContext(),
    error: this.error(),
    response: this.response(),
  }));

  constructor() {
    super();
    this.query.set('The toilet has no toilet papers again.');
    this.promptService.setPromptOptions({ initialPrompts: this.initialPrompts() });
  }
}

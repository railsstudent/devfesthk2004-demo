import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { TokenizationComponent } from './tokenization.component';
import { PromptResponse } from '../types/prompt-response.type';
import { FormsModule } from '@angular/forms';
import { LineBreakPipe } from '../pipes/line-break.pipe';

@Component({
  selector: 'app-prompt-response',
  imports: [TokenizationComponent, FormsModule, LineBreakPipe],
  template: `
    @let responseState = state();
    <app-tokenization [numPromptTokens]="responseState.numPromptTokens" [tokenContext]="responseState.tokenContext" />
    <div>
      <span class="label">Status: </span><span>{{ responseState.status }}</span>
    </div>
    <div>
      <span class="label" for="input">Prompt: </span>
      <textarea id="input" name="input" [(ngModel)]="query" [disabled]="responseState.disabled" rows="3"></textarea>
    </div>
    <button (click)="countPromptTokens.emit()" [disabled]="responseState.numTokensDisabled">Count Prompt Tokens</button>
    <button (click)="submitPrompt.emit()" [disabled]="responseState.submitDisabled">{{ responseState.text }}</button>
    <div>
      <span class="label">Response: </span>
      <p [innerHTML]="responseState.response | lineBreak"></p>
    </div>
    @let error = responseState.error;
    @if (error) {
      <div>
        <span class="label">Error: </span>
        <p>{{ error }}</p>
      </div>
    }
  `,
  styleUrl: './prompt.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromptResponseComponent {
  state = input.required<PromptResponse>();
  query = model.required<string>();

  countPromptTokens = output();
  submitPrompt = output();
}

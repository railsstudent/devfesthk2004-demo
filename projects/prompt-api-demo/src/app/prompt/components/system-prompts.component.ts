import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AbstractPromptService } from '../../ai/services/abstract-prompt.service';
import { SystemPromptService } from '../../ai/services/system-prompts.service';
import { BasePromptComponent } from './base-prompt.component';
import { TokenizationComponent } from './tokenization.component';

@Component({
  selector: 'app-system-prompt',
  standalone: true,
  imports: [FormsModule, TokenizationComponent],
  template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>System Prompts</h3>
      @let myState = state();
      <div>
        <span class="label" for="input">System Prompt: </span>
        <input id="input" name="input" [(ngModel)]="systemPrompt" />
      </div>
      <button (click)="createSession()" [disabled]="myState.disabled">Create session</button>
      <button (click)="destroySession()" [disabled]="myState.destroyDisabled">Destroy session</button>
      <app-tokenization [numPromptTokens]="numPromptTokens()" [tokenContext]="tokenContext()" />
      <div>
        <span class="label">Status: </span><span>{{ myState.status }}</span>
      </div>
      <div>
        <span class="label" for="input">Prompt: </span>
        <input id="input" name="input" [(ngModel)]="query" [disabled]="myState.disabled" />
      </div>
      <button (click)="countPromptTokens()" [disabled]="myState.numTokensDisabled">Count Prompt Tokens</button>
      <button (click)="submitPrompt()" [disabled]="myState.submitDisabled">{{ myState.text }}</button>
      <div>
        <span class="label">Response: </span>
        <p>{{ response() }}</p>
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
      useClass: SystemPromptService,
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemPromptsComponent extends BasePromptComponent {
  systemPrompt = signal('');
  tokenContext = this.promptService.tokenContext;

  async createSession() {
    try {
      this.isLoading.set(true);
      const systemPromptService = this.promptService as SystemPromptService;
      await systemPromptService.createSession(this.systemPrompt());
    } catch(e) {
      const errMsg = e instanceof Error ? (e as Error).message : 'Error in createSession';
      this.error.set(errMsg);
    } finally {
      this.isLoading.set(false);
    }
  }
}

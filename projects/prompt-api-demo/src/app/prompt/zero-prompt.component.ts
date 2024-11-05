import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ZeroPromptService } from '../ai/services/zero-prompt.service';
import { TokenizationComponent } from './tokenization.component';

@Component({
  selector: 'app-zero-prompt',
  standalone: true,
  imports: [FormsModule, TokenizationComponent],
  template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>Zero-shot prompting</h3>
      <app-tokenization [numPromptTokens]="numPromptTokens()" [tokenContext]="tokenContext()" />
      @let myState = state();
      <div>
        <span class="label">Status: </span><span>{{ myState.status }}</span>
      </div>
      <div>
        @if (isPerSession()) {
          <div>
            <span class="label" for="temp">Temperature: </span>
            <input type="number" id="temp" name="temp" class="per-session" [(ngModel)]="temperature" max="3" />
            <span class="label"> (Max temperature: 3) </span>          
            <span class="label" for="topK">TopK: </span>
            <input type="number" id="topK" name="topK" class="per-session" [(ngModel)]="topK" max="8" />
          </div>
        }
      </div>
      <div>
        @if (isPerSession()) {
          <div>
            <span class="label" for="temp">Per Session: </span>
            <span>{{ this.perSessionStr() }}</span>
          </div>
        }
        <span class="label" for="input">Prompt: </span>
        <input id="input" name="input" [(ngModel)]="query" [disabled]="myState.disabled" />
      </div>
      <button (click)="createSession()" [disabled]="myState.disabled">Create session</button>
      <button (click)="destroySession()" [disabled]="myState.destroyDisabled">Destroy session</button>
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
  styles: `
    input {
      width: 50%;
    }

    button, input {
      margin-bottom: 0.5rem;
    }

    button {
      margin-right: 0.5rem;
    }

    .per-session {
      width: 25%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZeroPromptComponent {
  promptService = inject(ZeroPromptService);
  isPerSession = input(false);

  session = this.promptService.session;
  
  isLoading = signal(false);
  error = signal('');
  query = signal('');
  response = signal('');
  numPromptTokens = signal(0);
  topK = signal(3);
  temperature = signal(1);

  tokenContext = this.promptService.tokenContext;

  state = computed(() => {
    const isLoading = this.isLoading();
    const session = this.session();
    const query = this.query().trim();
    return {
      status: isLoading ? 'Processing...' : 'Idle',
      text: isLoading ? 'Progressing...' : 'Submit',
      disabled: isLoading,
      destroyDisabled: !session || isLoading,
      numTokensDisabled: !session || isLoading || query === '',
      submitDisabled: !session || isLoading || query === ''
    }
  });

  perSessionStr = computed(() => {
    const perSession = this.promptService.perSession()
    if (perSession) {
      const { topK, temperature } = perSession;
      return `\{topK: ${topK}, temperature: ${temperature}\}`;
    }

    return '';
  })

  async createSession() {
    try {
      this.isLoading.set(true);
      await this.promptService.createSession(this.isPerSession(), 
        { topK: this.topK(), temperature: this.temperature() });
    } catch(e) {
      const errMsg = e instanceof Error ? (e as Error).message : 'Error in createSession';
      this.error.set(errMsg);
    } finally {
      this.isLoading.set(false);
    }
  }

  destroySession() {
    try {
      this.isLoading.set(true);
      this.promptService.destroySession();
    } catch(e) {
      const errMsg = e instanceof Error ? (e as Error).message : 'Error in destroySession';
      this.error.set(errMsg);
    } finally {
      this.isLoading.set(false);
    }
  }

  async countPromptTokens() {
    try {
      this.isLoading.set(true);
      const numTokens = await this.promptService.countNumTokens(this.query());
      this.numPromptTokens.set(numTokens);
    } catch(e) {
      const errMsg = e instanceof Error ? (e as Error).message : 'Error in countPromptTokens';
      this.error.set(errMsg);
    } finally {
      this.isLoading.set(false);
    }
  }

  async submitPrompt() {
    try {
      this.isLoading.set(true);
      this.error.set('');
      const answer = await this.promptService.prompt(this.query());
      this.response.set(answer);
    } catch(e) {
      const errMsg = e instanceof Error ? (e as Error).message : 'Error in submitPrompt';
      this.error.set(errMsg);
    } finally {
      this.isLoading.set(false);
    }
  }
}

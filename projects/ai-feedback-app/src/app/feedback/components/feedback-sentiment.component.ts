import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AILanguageModelInitialPromptRole } from '../../ai/enums/initial-prompt-role.enum';
import { PromptService } from '../../ai/services/prompt.service';
import { LanguageInitialPrompt } from '../../ai/types/language-initial-prompt.type';
import { LineBreakPipe } from '../pipes/line-break.pipe';

@Component({
  selector: 'app-feedback-sentimentt',
  standalone: true,
  imports: [FormsModule, LineBreakPipe],
  template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>Customer's Feedback</h3>
      @let myState = state();
      <div>
        <span class="label">Status: </span><span>{{ myState.status }}</span>
      </div>
      <div>
        <span class="label" for="input">Prompt: </span>
        <textarea id="input" name="input" [(ngModel)]="query" [disabled]="myState.disabled" rows="3"></textarea>
      </div>
      <!-- <button (click)="createSession()" [disabled]="myState.disabled">Create session</button>
      <button (click)="destroySession()" [disabled]="myState.destroyDisabled">Destroy session</button>
      <button (click)="submitPrompt()" [disabled]="myState.submitDisabled">{{ myState.text }}</button> -->
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackSentimentComponent implements OnDestroy {
  promptService = inject(PromptService);
  session = this.promptService.session();

  isLoading = signal(false);
  error = signal('');
  query = signal('La comida es buena y el servicio es excelente.');
  response = signal('');

  state = computed(() => {
    const isLoading = this.isLoading();
    const session = this.session();
    const isNoSessionOrBusy = !this.session() || this.isLoading();
    const isUnavailableForCall = isNoSessionOrBusy || this.query().trim() === '';
    return {
        status: isLoading ? 'Processing...' : 'Idle',
        text: isLoading ? 'Progressing...' : 'Submit',
        disabled: isLoading,
        destroyDisabled: !session || isLoading,
        numTokensDisabled: isUnavailableForCall,
        submitDisabled: isUnavailableForCall
    }
  });

  initialPrompts = signal<LanguageInitialPrompt[]>([
    { role: AILanguageModelInitialPromptRole.SYSTEM, content: `You are an expert in determine the sentiment of a text. 
    If it is positive, say 'positive'. If it is negative, say 'negative'. If you are not sure, then say 'not sure'` },
    { role: AILanguageModelInitialPromptRole.USER, content: "The food is affordable and delicious, and the venue is close to the train station." },
    { role: AILanguageModelInitialPromptRole.ASSISTANT, content: "positive" },
    { role: AILanguageModelInitialPromptRole.USER, content: "The waiters are very rude, the food is salty, and the drinks are sour." },
    { role: AILanguageModelInitialPromptRole.ASSISTANT, content: "negative" },
    { role: AILanguageModelInitialPromptRole.USER, content: "The weather is hot and sunny today." },
    { role: AILanguageModelInitialPromptRole.ASSISTANT, content: "postive" }
  ]);

  constructor() {
    this.isLoading.set(true)
    this.promptService.createSession(this.initialPrompts())
      .catch((e) => {
        const errMsg = e instanceof Error ? (e as Error).message : 'Error in createSession';
        this.error.set(errMsg);  
      })
      .finally(() => this.isLoading.set(false));
  }

  ngOnDestroy(): void {
    this.promptService.destroySession();
  }
}

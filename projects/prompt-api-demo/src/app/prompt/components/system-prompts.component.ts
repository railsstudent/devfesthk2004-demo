import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { AbstractPromptService } from '../../ai/services/abstract-prompt.service';
import { SystemPromptService } from '../../ai/services/system-prompts.service';
import { LineBreakPipe } from '../pipes/line-break.pipe';
import { BasePromptComponent } from './base-prompt.component';
import { TokenizationComponent } from './tokenization.component';

@Component({
    selector: 'app-system-prompt',
    imports: [FormsModule, TokenizationComponent, LineBreakPipe],
    template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>System Prompts</h3>
      @let myState = state();
      <div>
        <span class="label" for="input">System Prompt: </span>
        <textarea id="input" name="input" [(ngModel)]="systemPrompt" rows="4"></textarea>
      </div>
      <app-tokenization [numPromptTokens]="numPromptTokens()" [tokenContext]="tokenContext()" />
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
            useClass: SystemPromptService,
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemPromptsComponent extends BasePromptComponent {
  systemPrompt = signal(`You are an expert that knows the official languages of a location. State the languages, separated by commas, and no historic background. If you don't know the answer, then say "Sorry, it is not a country. Please answer in English"`);
  tokenContext = this.promptService.tokenContext;

  constructor() {
    super();
    this.query.set('China');
    toObservable(this.systemPrompt) 
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(async (systemPrompt) => {

            this.promptService.destroySession();
            this.promptService.setPromptOptions({ systemPrompt });
            await this.promptService.createSessionIfNotExists();
        })
      )
      .subscribe();   

    this.promptService.setPromptOptions({ systemPrompt: this.systemPrompt() });
  }
}

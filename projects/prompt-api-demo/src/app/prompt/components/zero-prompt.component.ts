import { ChangeDetectionStrategy, Component, computed, input, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AbstractPromptService } from '../../ai/services/abstract-prompt.service';
import { ZeroPromptService } from '../../ai/services/zero-prompt.service';
import { LineBreakPipe } from '../pipes/line-break.pipe';
import { BasePromptComponent } from './base-prompt.component';
import { TokenizationComponent } from './tokenization.component';

@Component({
    selector: 'app-zero-prompt',
    imports: [FormsModule, TokenizationComponent, LineBreakPipe],
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
        <textarea id="input" name="input" [(ngModel)]="query" [disabled]="myState.disabled" 
          rows="3"></textarea>
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
          useClass: ZeroPromptService,
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZeroPromptComponent extends BasePromptComponent implements OnChanges {
  isPerSession = input(false);
  zeroPromptService = this.promptService as ZeroPromptService;
  temperature = this.zeroPromptService.temperature;
  topK = this.zeroPromptService.topK;
  tokenContext = this.zeroPromptService.tokenContext;

  ngOnChanges(): void {
    this.zeroPromptService.isPerSession.set(this.isPerSession());
  }

  perSessionStr = computed(() => {
    if (this.isPerSession()) {
      return `\{topK: ${this.topK()}, temperature: ${this.temperature()}\}`;
    }

    return '';
  });
}

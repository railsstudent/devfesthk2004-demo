import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { AbstractPromptService } from '../../ai/services/abstract-prompt.service';
import { SystemPromptService } from '../../ai/services/system-prompts.service';
import { PromptResponse } from '../types/prompt-response.type';
import { BasePromptComponent } from './base-prompt.component';
import { PromptResponseComponent } from './prompt-response.component';

@Component({
    selector: 'app-system-prompt',
    imports: [FormsModule, PromptResponseComponent],
    template: `
    <div class="session">
      <h3>System Prompts</h3>
      <div>
        <span class="label" for="input">System Prompt: </span>
        <textarea id="input" name="input" [(ngModel)]="systemPrompt" rows="4" [disabled]="state().disabled"></textarea>
      </div>
      <app-prompt-response [state]="responseState()" [(query)]="query" 
        (countPromptTokens)="countPromptTokens()" (submitPrompt)="submitPrompt()"
      />
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
  systemPrompt = signal(`You are an professional trip planner who helps travelers to plan a trip to a location. When a traveler specifies a country or a city, you have to recommend how to apply travel visa, pack suitable clothes for the weather and essentials, and the known attractions to visit each day. It is preferred to visit two to three attractions each day to maximize the value of the trip. If you don't know the answer, say "I do not know the answer."`);
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
    this.query.set('I will visit from Hong Kong to Taipei between Feb 13th to Feb 18th. Please help me plan the trip and assume I will arrive in the afternoon on day 1.');
    toObservable(this.systemPrompt) 
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(async (systemPrompt) => {
            this.promptService.destroySession();
            this.promptService.setPromptOptions({ systemPrompt });
            await this.promptService.createSessionIfNotExists();
        }),
        takeUntilDestroyed(),
      )
      .subscribe();   

    this.promptService.setPromptOptions({ systemPrompt: this.systemPrompt() });
  }
}

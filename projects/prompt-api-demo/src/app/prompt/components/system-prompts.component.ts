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
      <app-prompt-response [state]="responseState()" [(query)]="query" (submitPrompt)="submitPrompt()" />
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
  systemPrompt = signal(`You are a professional trip planner who helps travelers to plan a trip to a location. When a traveler specifies a country or city, you have to recommend how to apply for travel visas, pack suitable clothes for the weather and essentials, and list the known attractions to visit daily. It is preferred to visit two to three attractions each day to maximize the value of the trip. Moreover, suggest budget hotel that has convenient transportation to attractions and to airport. If you don't know the answer, say, "I do not know the answer."`);
  tokenContext = this.promptService.tokenContext;
  
  responseState = computed<PromptResponse>(() => ({
    ...this.state(),
    numPromptTokens: this.numPromptTokens(),
    tokenContext: this.tokenContext(),
    error: this.error(),
    value: this.value(),
  }));

  constructor() {
    super();
    this.query.set('I will visit from Hong Kong to Shanghai between August 12th to August 15th to attend Google I/O 2025 Shanghai. Please help me plan the trip and assume I will arrive in the evening of the 12th.  The conference will be on the 13th and 14th and we will have free time for activities and sightseeing in the evening.  On the 15th, there will be APAC GDE summit before taking the flight home.');
    toObservable(this.systemPrompt) 
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(async (systemPrompt) => {
            this.promptService.destroySession();
            this.promptService.setPromptOptions({
              initialPrompts: [
                { role: 'system', content: systemPrompt }
              ]
            });
            await this.promptService.createSessionIfNotExists();
        }),
        takeUntilDestroyed(),
      )
      .subscribe();   

    this.promptService.setPromptOptions(
      {
        initialPrompts: [
          { role: 'system', content: this.systemPrompt() }
        ]
      }
    );
  }
}

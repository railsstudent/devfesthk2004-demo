import { ChangeDetectionStrategy, Component, computed, input, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { AbstractPromptService } from '../../ai/services/abstract-prompt.service';
import { ZeroPromptService } from '../../ai/services/zero-prompt.service';
import { PromptResponse } from '../types/prompt-response.type';
import { BasePromptComponent } from './base-prompt.component';
import { PromptResponseComponent } from './prompt-response.component';

@Component({
    selector: 'app-zero-prompt',
    imports: [FormsModule, PromptResponseComponent],
    template: `
    <div class="session">
      <h3>Zero-shot prompting</h3>
      <app-prompt-response [state]="responseState()" [(query)]="query" 
        (countPromptTokens)="countPromptTokens()" (submitPrompt)="submitPrompt()"
        [perSessionTemplate]="isPerSession() ? template() : undefined"
        [perSessionTemplateContext]="templateContext()"
      />
      <ng-template #session let-capabilities="capabilities">
        <div>
          <div>
            <span class="label" for="temp">Temperature: </span>
            <input type="number" id="temp" name="temp" class="per-session" [(ngModel)]="capabilities.temperature" max="3" />
            <span class="label"> (Max temperature: 3) </span>          
            <span class="label" for="topK">TopK: </span>
            <input type="number" id="topK" name="topK" class="per-session" [(ngModel)]="capabilities.topK" max="8" />
          </div>
          <div>
            <span class="label" for="temp">Per Session: </span>
            <span>{{ capabilities.description }}</span>
          </div>
        </div>
      </ng-template>
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
export class ZeroPromptComponent extends BasePromptComponent {
  isPerSession = input(false);
  zeroPromptService = this.promptService as ZeroPromptService;
  template = viewChild.required('session', { read: TemplateRef });

  responseState = computed<PromptResponse>(() => ({
    ...this.state(),
    numPromptTokens: this.numPromptTokens(),
    tokenContext: this.zeroPromptService.tokenContext(),
    error: this.error(),
    response: this.response(),
  }));

  capabilities = computed(() => ({
    temperature: this.zeroPromptService.temperature(),
    topK: this.zeroPromptService.topK(),
  }));

  templateContext = computed(() => this.isPerSession() ? { 
      capabilities: { 
        temperature: this.zeroPromptService.temperature,
        topK: this.zeroPromptService.topK,
        description: this.zeroPromptService.description(),
      } 
    } : undefined
  );

  constructor() {
    super();
    toObservable(this.capabilities) 
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => a.temperature === b.temperature && a.topK === b.topK),
        switchMap(async ({ topK, temperature }) => {
          await this.zeroPromptService.resetConfigs({ temperature, topK });
          await this.zeroPromptService.createSessionIfNotExists();
        }),
        takeUntilDestroyed(),
      ).subscribe();

    toObservable(this.isPerSession).pipe(
tap(async (isPerSession) => {
        this.zeroPromptService.isPerSession.set(isPerSession);
        if (!isPerSession) {
          await this.zeroPromptService.resetConfigs();
          await this.zeroPromptService.createSessionIfNotExists();
        }
      }),
      takeUntilDestroyed(),
    ).subscribe();
  }
}

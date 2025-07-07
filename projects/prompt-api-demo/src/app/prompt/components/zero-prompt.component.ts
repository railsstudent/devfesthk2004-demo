import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { AbstractPromptService } from '../../ai/services/abstract-prompt.service';
import { ZeroPromptService } from '../../ai/services/zero-prompt.service';
import { Capability } from '../types/capbilities.type';
import { PromptResponse } from '../types/prompt-response.type';
import { BasePromptComponent } from './base-prompt.component';
import { PromptResponseComponent } from './prompt-response.component';

const cmpCapabilties = (a: Capability, b: Capability) => a.temperature === b.temperature && a.topK === b.topK;

@Component({
    selector: 'app-zero-prompt',
    imports: [FormsModule, PromptResponseComponent],
    template: `
    <div class="session">
      <h3>Zero-shot prompting</h3>
      <app-prompt-response [state]="responseState()" [(query)]="query" 
        (countPromptTokens)="countPromptTokens()" (submitPrompt)="submitPrompt()"
        [perSessionTemplate]="isPerSession() ? session : undefined"
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
            <span>{{ capabilities.configValues }}</span>
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
  
  responseState = computed<PromptResponse>(() => ({
    ...this.state(),
    numPromptTokens: this.numPromptTokens(),
    tokenContext: this.zeroPromptService.tokenContext(),
    error: this.error(),
    chunk: this.chunk(),
  }));

  temperature = this.zeroPromptService.temperature;
  topK = this.zeroPromptService.topK;
  capabilities = computed(() => ({
    temperature: this.temperature(),
    topK: this.topK(),
  }));

  templateContext = computed(() => this.isPerSession() ? { 
      capabilities: { 
        temperature: this.temperature,
        topK: this.topK,
        configValues: this.zeroPromptService.configValues(),
      } 
    } : undefined
  );

  constructor() {
    super();
    toObservable(this.capabilities) 
      .pipe(
        debounceTime(300),
        distinctUntilChanged(cmpCapabilties),
        switchMap(async (data) => {
          await this.zeroPromptService.resetConfigs(data);
          await this.zeroPromptService.createSessionIfNotExists();
        }),
        takeUntilDestroyed(),
      ).subscribe();

    toObservable(this.isPerSession).pipe(takeUntilDestroyed())
    .subscribe({
      next: async (isPerSession) => {
        if (!isPerSession) {
          await this.zeroPromptService.resetConfigs();
          await this.zeroPromptService.createSessionIfNotExists();
        }
      }
    });
  }
}

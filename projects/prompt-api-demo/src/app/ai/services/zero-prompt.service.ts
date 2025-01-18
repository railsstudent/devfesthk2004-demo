import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { from } from 'rxjs';
import { ERROR_CODES } from '../enums/error-codes.enum';
import { PromptOptions } from '../types/prompt.type';
import { AbstractPromptService } from './abstract-prompt.service';

@Injectable({
  providedIn: 'root'
})
export class ZeroPromptService extends AbstractPromptService implements OnDestroy {
  #controller = new AbortController();
  topK = signal(3);
  temperature = signal(1);

  configValues = computed(() =>
    `\{topK: ${this.topK()}, temperature: ${this.temperature()}\}`
  );

  getCapabilities() {
    if (!this.promptApi) {
      throw new Error(ERROR_CODES.NO_PROMPT_API);
    } else if (!this.promptApi.capabilities) {
      throw new Error(ERROR_CODES.NO_LARGE_LANGUAGE_MODEL);
    }

    return from(this.promptApi.capabilities());
  }

  override async createPromptSession(options?: PromptOptions): Promise<AILanguageModel | undefined> {
    const createOptions = {
      signal: this.#controller.signal,
      temperature: this.temperature(),
      topK: this.topK()
    };

    console.log('createOptions', createOptions);
    return this.promptApi?.create({ ...options, ...createOptions });
  }

  async resetConfigs(config?: { temperature: number, topK: number }) {
    const capabilities = await this.promptApi?.capabilities();
    const defaultTemperature = capabilities?.defaultTemperature || 1;
    const defaultTopK = capabilities?.defaultTopK || 3;
    const { temperature = defaultTemperature, topK = defaultTopK } = config || {}; 

    this.destroySession();
    this.temperature.set(temperature);
    this.topK.set(topK);
  }

  ngOnDestroy(): void {
    this.destroySession();
  }
}

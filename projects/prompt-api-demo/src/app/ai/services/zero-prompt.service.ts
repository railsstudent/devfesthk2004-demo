import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { from } from 'rxjs';
import { ERROR_CODES } from '../enums/error-codes.enum';
import { AbstractPromptService } from './abstract-prompt.service';

@Injectable({
  providedIn: 'root'
})
export class ZeroPromptService extends AbstractPromptService implements OnDestroy {
  topK = signal(3);
  temperature = signal(1);

  configValues = computed(() =>
    `\{topK: ${this.topK()}, temperature: ${this.temperature()}\}`
  );

  getCapabilities() {
    return from(LanguageModel.params());
  }

  override async createPromptSession(options?: LanguageModelCreateOptions): Promise<LanguageModel | undefined> {
    const createOptions = {
      signal: this.controller.signal,
      temperature: this.temperature(),
      topK: this.topK()
    };

    console.log('createOptions', createOptions);
    return LanguageModel.create({ ...options, ...createOptions });
  }

  async resetConfigs(config?: { temperature: number, topK: number }) {
    const capabilities = await LanguageModel.params();
    const defaultTemperature = capabilities.defaultTemperature || 1;
    const defaultTopK = capabilities.defaultTopK || 3;
    const { temperature = defaultTemperature, topK = defaultTopK } = config || {}; 

    this.destroySession();
    this.temperature.set(temperature);
    this.topK.set(topK);
  }

  ngOnDestroy(): void {
    this.destroySession();
  }
}

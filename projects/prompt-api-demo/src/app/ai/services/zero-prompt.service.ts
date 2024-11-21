import { Injectable, signal } from '@angular/core';
import { firstValueFrom, from } from 'rxjs';
import { SessionConfiguration } from '../types/prompt.type';
import { AbstractPromptService } from './abstract-prompt.service';

@Injectable({
  providedIn: 'root'
})
export class ZeroPromptService extends AbstractPromptService  {
  #controller = new AbortController();
  #perSession = signal<{ topK: number, temperature: number } | undefined>(undefined);
  perSession = this.#perSession.asReadonly();

  async createSession(isPerSession: boolean, configuration: SessionConfiguration) {
    this.destroySession();
    
    const capabilities = await firstValueFrom(this.getCapabilities());
    const temperature = Math.min(configuration.temperature, 3);
    const topK = Math.floor(Math.min(configuration.topK, capabilities.maxTopK || 0));
    const createOptions = isPerSession ? {
      signal: this.#controller.signal,
      temperature,
      topK,
    } : { signal: this.#controller.signal };

    this.#perSession.set({
      topK,
      temperature
    });

    console.log('createOptions', createOptions);
    const newSession = await this.promptApi?.create(createOptions);
    this.resetSession(newSession);
  }

  getCapabilities() {
    if (!this.promptApi) {
      throw new Error(`Your browser doesn't support the Prompt API. If you are on Chrome, join the Early Preview Program to enable it.`);
    } else if (!this.promptApi.capabilities) {
      throw new Error('Capabilities detection is unsupported. Please check your configuration in chrome://flags/#optimization-guide-on-device-model');
    }

    return from(this.promptApi.capabilities() as Promise<AILanguageModelCapabilities>);
  }
}

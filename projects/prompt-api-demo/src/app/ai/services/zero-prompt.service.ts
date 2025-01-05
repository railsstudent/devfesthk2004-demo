import { Injectable, OnDestroy, signal } from '@angular/core';
import { from } from 'rxjs';
import { ERROR_CODES } from '../enums/error-codes.enum';
import { PromptOptions } from '../types/prompt.type';
import { AbstractPromptService } from './abstract-prompt.service';

@Injectable({
  providedIn: 'root'
})
export class ZeroPromptService extends AbstractPromptService implements OnDestroy {
  #controller = new AbortController();
  perSession = signal<Pick<AILanguageModel, "temperature" | "topK"> | undefined>(undefined);
  isPerSession = signal(false);

  getCapabilities() {
    if (!this.promptApi) {
      throw new Error(ERROR_CODES.NO_PROMPT_API);
    } else if (!this.promptApi.capabilities) {
      throw new Error(ERROR_CODES.NO_LARGE_LANGUAGE_MODEL);
    }

    return from(this.promptApi.capabilities());
  }

  override async createPromptSession(options?: PromptOptions): Promise<AILanguageModel | undefined> {
    const capabilities = await this.promptApi?.capabilities();
    const configurations = this.perSession();
    const temperature = Math.min(configurations?.temperature || 0, 3);
    const topK = Math.floor(Math.min(configurations?.topK || 0, capabilities?.maxTopK || 0));
    const createOptions = this.isPerSession() ? {
      signal: this.#controller.signal,
      temperature,
      topK,
    } : { signal: this.#controller.signal };

    console.log('createOptions', createOptions);
    return this.promptApi?.create({ ...options, ...createOptions });
  }

  ngOnDestroy(): void {
    this.destroySession();
  }
}

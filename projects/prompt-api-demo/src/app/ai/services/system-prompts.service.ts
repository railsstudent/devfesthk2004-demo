import { Injectable, OnDestroy } from '@angular/core';
import { AbstractPromptService } from './abstract-prompt.service';
import { PromptOptions } from '../types/prompt.type';

@Injectable({
  providedIn: 'root'
})
export class SystemPromptService extends AbstractPromptService implements OnDestroy  {
  #controller = new AbortController();

  override async createPromptSession(options?: PromptOptions): Promise<AILanguageModel | undefined> {
    const { systemPrompt = undefined } = options || {};
    return this.promptApi?.create({ systemPrompt, signal: this.#controller.signal });
  }
  
  ngOnDestroy(): void {
    this.destroySession();
  }
}

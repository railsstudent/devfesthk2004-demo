import { Injectable, OnDestroy } from '@angular/core';
import { AbstractPromptService } from './abstract-prompt.service';
import { PromptOptions } from '../types/prompt.type';

@Injectable({
  providedIn: 'root'
})
export class NShotsPromptService extends AbstractPromptService implements OnDestroy  {
  #controller = new AbortController();

  override async createPromptSession(options?: PromptOptions): Promise<AILanguageModel | undefined> {
    const { initialPrompts = undefined } = options || {};
    return this.promptApi?.create({ initialPrompts, signal: this.#controller.signal });
  }

  ngOnDestroy(): void {
    this.destroySession();
  }
}

import { Injectable } from '@angular/core';
import { LanguageInitialPrompt } from '../types/language-initial-prompt.type';
import { AbstractPromptService } from './abstract-prompt.service';

@Injectable({
  providedIn: 'root'
})
export class NShotsPromptService extends AbstractPromptService  {
  #controller = new AbortController();

  async createSession(initialPrompts: LanguageInitialPrompt[]) {
    this.destroySession();

    const newSession = await this.promptApi?.create({ initialPrompts }, { signal: this.#controller.signal });
    this.resetSession(newSession);
  }
}

import { Injectable } from '@angular/core';
import { AbstractPromptService } from './abstract-prompt.service';
import { LanguageInitialPrompt } from '../types/prompt.type';

@Injectable({
  providedIn: 'root'
})
export class NShotsPromptService extends AbstractPromptService  {
  #controller = new AbortController();

  async createSession(initialPrompts: LanguageInitialPrompt) {
    this.destroySession();

    const newSession = await this.promptApi?.create({ initialPrompts, signal: this.#controller.signal });
    this.resetSession(newSession);
  }
}

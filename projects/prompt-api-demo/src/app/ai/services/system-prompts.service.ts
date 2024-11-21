import { Injectable } from '@angular/core';
import { AbstractPromptService } from './abstract-prompt.service';

@Injectable({
  providedIn: 'root'
})
export class SystemPromptService extends AbstractPromptService {
  #controller = new AbortController();

  async createSession(systemPrompt: string) {
    this.destroySession();
    
    const newSession = await this.promptApi?.create({ systemPrompt, signal: this.#controller.signal });
    this.resetSession(newSession);
  }
}

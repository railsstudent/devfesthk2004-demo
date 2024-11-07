import { inject, Injectable, signal } from '@angular/core';
import { from } from 'rxjs';
import { AI_TRANSLATION_API_TOKEN } from '../constants/core.constant';
import { LanguageModelCapabilities } from '../types/language-model-capabilties.type';
import { Tokenization } from '../types/prompt.type';
import { AbstractPromptService } from './abstract-prompt.service';

@Injectable({
  providedIn: 'root'
})
export class SystemPromptService extends AbstractPromptService {
  #controller = new AbortController();

  async createSession(systemPrompt: string) {
    this.destroySession();
    
    const newSession = await this.promptApi?.create({ systemPrompt }, { signal: this.#controller.signal });
    this.resetSession(newSession);
  }
}

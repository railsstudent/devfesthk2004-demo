import { Injectable, OnDestroy } from '@angular/core';
import { AbstractPromptService } from './abstract-prompt.service';

@Injectable({
  providedIn: 'root'
})
export class SystemPromptService extends AbstractPromptService implements OnDestroy  {
  override async createPromptSession(options?: LanguageModelCreateOptions): Promise<LanguageModel | undefined> {
    const { initialPrompts = [] } = options || {};
    const systemPromptMessage = initialPrompts.find(prompt => prompt.role === 'system');

    if (!systemPromptMessage) {
      throw new Error('System prompt is not found');
    }

    return LanguageModel.create({ 
      initialPrompts: [
        systemPromptMessage as LanguageModelSystemMessage
      ],
      signal: this.controller.signal });
  }
  
  ngOnDestroy(): void {
    this.controller.abort();
    this.destroySession();
  }
}

import { inject, Injectable } from '@angular/core';
import { AI_PROMPT_API_TOKEN } from '../constants/core.constant';

@Injectable({
  providedIn: 'root'
})
export class PromptService {
  #aiAssistant = inject(AI_PROMPT_API_TOKEN);

  async prompt(query: string): Promise<string> {
    if (!this.#aiAssistant) {
      throw new Error(`Your browser doesn't support the Prompt API. If you are on Chrome, join the Early Preview Program to enable it.`);
    }

    const controller = new AbortController();
    const session = await this.#aiAssistant.create({
      systemPrompt: 'You are a customer service expert who replies to customer feedback in the same language.',
      signal: controller.signal,
    });
    if (!session) {
      throw new Error('Failed to create AITextSession.');
    }

    const answer = await session.prompt(query);
    session.destroy();

    return answer;
  }
}

import { inject, Injectable } from '@angular/core';
import { from } from 'rxjs';
import { AI_PROMPT_API_TOKEN } from '../constants/core.constant';
import { LanguageModelCapabilities } from '../types/language-model-capabilties.type';

@Injectable({
  providedIn: 'root'
})
export class PromptService {
  #promptApi = inject(AI_PROMPT_API_TOKEN);

  getCapabilities() {
    if (!this.#promptApi) {
      throw new Error(`Your browser doesn't support the Prompt API. If you are on Chrome, join the Early Preview Program to enable it.`);
    } else if (!this.#promptApi.capabilities) {
      throw new Error('Capabilities detection is unsupported. Please check your configuration in chrome://flags/#optimization-guide-on-device-model');
    }

    return from(this.#promptApi.capabilities() as Promise<LanguageModelCapabilities>);
  }

  async prompt(query: string): Promise<string> {
    if (!this.#promptApi) {
      throw new Error(`Your browser doesn't support the Prompt API. If you are on Chrome, join the Early Preview Program to enable it.`);
    }

    const controller = new AbortController();
    const session = await this.#promptApi.create({
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

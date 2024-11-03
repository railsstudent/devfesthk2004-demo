import { inject, Injectable, Injector, Signal } from '@angular/core';
import { from } from 'rxjs';
import { AI_PROMPT_API_TOKEN } from '../constants/core.constant';
import { LanguageModelCapabilities } from '../types/language-model-capabilties.type';
import { CustomPrompt } from '../types/prompt.type';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ZeroPromptService {
  #promptApi = inject(AI_PROMPT_API_TOKEN);
  #controller = new AbortController();
  #session$ = from(this.#promptApi!.create({
    signal: this.#controller.signal
  }));

  getSession(injector: Injector) {
    return toSignal(this.#session$, { initialValue: undefined, injector }) as Signal<any>;
  }

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

    const session = await this.#promptApi.create({  signal: this.#controller.signal });
    if (!session) {
      throw new Error('Failed to create AITextSession.');
    }

    const answer = await session.prompt(query);
    session.destroy();

    return answer;
  }

  countNumTokens(session: any, query: string): Promise<number> {
    return session.countPromptTokens(query);
  }
}

import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, from } from 'rxjs';
import { AI_PROMPT_API_TOKEN } from '../constants/core.constant';
import { LanguageModelCapabilities } from '../types/language-model-capabilties.type';
import { SessionConfiguration, Tokenization } from '../types/prompt.type';

@Injectable({
  providedIn: 'root'
})
export class SystemPromptService {
  #promptApi = inject(AI_PROMPT_API_TOKEN);
  #session = signal<any | null>(null);
  session = this.#session.asReadonly();
  #controller = new AbortController();
  #tokenContext = signal<Tokenization | null>(null);
  tokenContext = this.#tokenContext.asReadonly();
  #perSession = signal<{ topK: number, temperature: number } | undefined>(undefined);
  perSession = this.#perSession.asReadonly();

  private resetSession(newSession: any) {
    this.#session.set(newSession);
    this.#tokenContext.set(null);
  }

  async createSession(isPerSession: boolean, configuration: SessionConfiguration) {
    const oldSession = this.#session();
    if (oldSession) {
      console.log('Destroy the prompt session.');
      oldSession.destroy();
    }
    
    const capabilities = await firstValueFrom(this.getCapabilities());
    const temperature = Math.min(configuration.temperature, 3);
    const topK = Math.floor(Math.min(configuration.topK, capabilities.maxTopK));
    const createOptions = isPerSession ? {
      signal: this.#controller.signal,
      temperature,
      topK,
    } : { signal: this.#controller.signal };

    this.#perSession.set({
      topK,
      temperature
    });

    console.log('createOptions', createOptions);
    const newSession = await this.#promptApi?.create(createOptions);
    this.resetSession(newSession);
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

    const session = this.session();
    if (!session) {
      throw new Error('Failed to create AITextSession.');
    }

    const answer = await session.prompt(query);
    this.#tokenContext.set({
      tokensSoFar: session.tokensSoFar as number,
      maxTokens: session.maxTokens as number,
      tokensLeft: session.tokensLeft as number,
    })

    return answer;
  }

  countNumTokens(query: string): Promise<number> {
    if (!this.#session) {
      return Promise.resolve(0);
    }

    const session = this.#session();
    return session.countPromptTokens(query) as Promise<number>;
  }

  destroySession() {
    const session = this.session();

    if (session) {
      session.destroy();
      this.resetSession(null);
    }
  }
}

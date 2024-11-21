import { inject, Injectable, signal } from '@angular/core';
import { AI_PROMPT_API_TOKEN } from '../constants/core.constant';
import { LanguageInitialPrompt } from '../types/language-initial-prompt.type';

const INITIAL_PROMPTS: LanguageInitialPrompt = [
  { role: 'system', content: `You are an expert in determine the sentiment of a text. 
  If it is positive, say 'positive'. If it is negative, say 'negative'. If you are not sure, then say 'not sure'` },
  { role: 'user', content: "The food is affordable and delicious, and the venue is close to the train station." },
  { role: 'assistant', content: "positive" },
  { role: 'user', content: "The waiters are very rude, the food is salty, and the drinks are sour." },
  { role: 'assistant', content: "negative" },
  { role: 'user', content: "The weather is hot and sunny today." },
  { role: 'assistant', content: "postive" }
];

@Injectable({
  providedIn: 'root'
})
export class NShotPromptService {
  #promptApi = inject(AI_PROMPT_API_TOKEN);
  #session = signal<any | null>(null);
  #controller = new AbortController();
  
  private async createSession(initialPrompts: LanguageInitialPrompt) {
    this.destroySession();

    const newSession = await this.#promptApi?.create({ initialPrompts, signal: this.#controller.signal });
    this.#session.set(newSession);
  }

  async prompt(query: string): Promise<string> {
    if (!this.#promptApi) {
      throw new Error(`Your browser doesn't support the Prompt API. If you are on Chrome, join the Early Preview Program to enable it.`);
    }

    if (!this.#session()) {
      await this.createSession(INITIAL_PROMPTS);
    }

    const session = this.#session();
    if (!session) {
      throw new Error('Failed to create a Prompt session.');
    }

    return session.prompt(query);
  }

  destroySession() {
      const session = this.#session();

      if (session && session.destroy) {
          session.destroy();
          this.#session.set(null);
      }
  }
}

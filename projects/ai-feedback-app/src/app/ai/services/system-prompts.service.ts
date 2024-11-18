import { inject, Injectable, signal } from '@angular/core';
import { AI_PROMPT_API_TOKEN } from '../constants/core.constant';

@Injectable({
  providedIn: 'root'
})
export class SystemPromptService {
  #promptApi = inject(AI_PROMPT_API_TOKEN);
  #session = signal<any | null>(null);
  #controller = new AbortController();

  private async createSession(systemPrompt: string) {
    this.destroySession();
    
    const newSession = await this.#promptApi?.create({ systemPrompt }, { signal: this.#controller.signal });
    this.#session.set(newSession);
  }

  async prompt(query: string, sentiment: string): Promise<string> {
    if (!this.#promptApi) {
      throw new Error(`Your browser doesn't support the Prompt API. If you are on Chrome, join the Early Preview Program to enable it.`);
    }

    if (!this.#session()) {
      await this.createSession('You are a professional writer who drafts a response for feedback in English.');
    }

    const session = this.#session();
    if (!session) {
      throw new Error('Failed to create a Prompt session.');
    }

    const responsePrompt = `
      The customer wrote a ${sentiment} feedback. Please draft the response in one paragraph, 200 words max.
      The response must be in formal English and do not use contractions such as "We're" and "I'm".
      Feedback: ${query} 
    `;

    return session.prompt(responsePrompt);
  }

  destroySession() {
    const session = this.#session();

    if (session && session.destroy) {
        session.destroy();
        this.#session.set(null);
    }
  }
}

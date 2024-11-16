import { inject, Injectable, signal } from '@angular/core';
import { AI_PROMPT_API_TOKEN } from '../constants/core.constant';

@Injectable({
  providedIn: 'root'
})
export class PromptService {
  promptApi = inject(AI_PROMPT_API_TOKEN);
  #session = signal<any | null>(null);
  session = this.#session.asReadonly();

  async prompt(query: string): Promise<string> {
      if (!this.promptApi) {
      throw new Error(`Your browser doesn't support the Prompt API. If you are on Chrome, join the Early Preview Program to enable it.`);
      }

      const session = this.session();
      if (!session) {
          throw new Error('Failed to create Prompt session.');
      }

      return  session.prompt(query);
  }

  destroySession() {
      const session = this.session();

      if (session && session.destroy) {
          session.destroy();
          this.#session.set(null);
      }
  }
}

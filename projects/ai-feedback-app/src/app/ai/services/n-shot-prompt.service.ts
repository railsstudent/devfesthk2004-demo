import { Injectable, OnDestroy, signal } from '@angular/core';
import { PROMPT_OPTIONS } from '../constants/prompt.constant';

@Injectable({
  providedIn: 'root'
})
export class NShotPromptService implements OnDestroy {
  #session = signal<LanguageModel | undefined>(undefined);
  #controller = new AbortController();
  
  async prompt(query: string): Promise<string> {
    if (!this.#session()) {
      const newSession = await LanguageModel.create({ 
        ...PROMPT_OPTIONS, 
        signal: this.#controller.signal 
      });
  
      this.#session.set(newSession);
    }

    const session = this.#session();
    if (!session) {
      throw new Error('Failed to create a Prompt session.');
    }

    return session.prompt(query);
  }

  destroySession() {
      const session = this.#session();

      if (session) {
        console.log('Destroying the session.');
        session.destroy();
        this.#session.set(undefined);
      }
  }

  ngOnDestroy(): void {
    this.#controller.abort();
    this.destroySession();
  }
}

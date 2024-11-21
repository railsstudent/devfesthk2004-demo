import { inject, Injectable, signal } from '@angular/core';
import { AI_WRITER_API_TOKEN } from '../constants/core.constant';

@Injectable({
  providedIn: 'root'
})
export class WriterService {
  #writerApi = inject(AI_WRITER_API_TOKEN);
  #session = signal<AIWriter | undefined>(undefined);
  #controller = new AbortController();

  private async createSession(options?: AIWriterCreateOptions) {
    this.destroySession();
    
    const newSession = await this.#writerApi?.create({ ...options, signal: this.#controller.signal });
    this.#session.set(newSession);
  }

  async generateDraft(query: string, sentiment: string): Promise<string> {
    if (!this.#writerApi) {
      throw new Error(`Your browser doesn't support the Prompt API. If you are on Chrome, join the Early Preview Program to enable it.`);
    }

    if (!this.#session()) {
      await this.createSession({ sharedContext: 'You are a professional public relation who drafts a response for feedback in English.' });
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

    return session.write(responsePrompt);
  }

  destroySession() {
    const session = this.#session();

    if (session) {
        session.destroy();
        this.#session.set(undefined);
    }
  }
}

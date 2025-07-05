import { Injectable, OnDestroy, signal } from '@angular/core';
import { WRITER_OPTIONS } from '../constants/writer.constant';

@Injectable({
  providedIn: 'root'
})
export class WriterService implements OnDestroy {
  #writer = signal<Writer | undefined>(undefined);
  #controller = new AbortController();

  async generateDraft(query: string, sentiment: string): Promise<string> {
    if (!this.#writer()) {
      const writer = await Writer.create({ ...WRITER_OPTIONS, signal: this.#controller.signal });
      this.#writer.set(writer);
    }

    const session = this.#writer();
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
    const session = this.#writer();

    if (session) {
      console.log('Destroying the writer.');
      session.destroy();
      this.#writer.set(undefined);
    }
  }

  ngOnDestroy(): void {
    this.#controller.abort();
    this.destroySession();
  }
}

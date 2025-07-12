import { Injectable, OnDestroy, signal } from '@angular/core';
import { WRITER_OPTIONS } from '../constants/writer.constant';

@Injectable({
  providedIn: 'root'
})
export class WriterService implements OnDestroy {
  #writer = signal<Writer | undefined>(undefined);
  #controller = new AbortController();

  #chunk = signal<string>('');
  chunk = this.#chunk.asReadonly();
  #done = signal<boolean | undefined>(undefined);
  doneGenerating = this.#done.asReadonly();

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

  async generateDraftStream(query: string, sentiment: string): Promise<void> {
    if (!this.#writer()) {
      const writer = await Writer.create({ ...WRITER_OPTIONS, signal: this.#controller.signal });
      this.#writer.set(writer);
    }

    const writer = this.#writer();
    if (!writer) {
      throw new Error('Failed to create a writer.');
    }

    const responsePrompt = `
      The customer wrote a ${sentiment} feedback. Please draft the response in one paragraph, 200 words max.
      The response must be in formal English and do not use contractions such as "We're" and "I'm".
      Feedback: ${query} 
    `;

    const stream = await writer.writeStreaming(
      responsePrompt, 
        { signal: this.#controller.signal }
    );

    this.#chunk.set('');
    this.#done.set(false);
    const self = this;
    const reader = stream.getReader();
    reader.read()
        .then(function processText({ value, done }): any {
            if (done) {
                self.#done.set(done);
                return;
            }

            self.#chunk.update((prev) => prev + value);
            return reader.read().then(processText);
        })
        .catch((err) => {
            console.error(err);
            if (err instanceof Error) {
                throw err;
            }
            throw new Error('Error in streaming the summary.');
        });
  }

  #destroyWriter() {
    const writer = this.#writer();

    if (writer) {
      console.log('Destroying the writer.');
      writer.destroy();
      this.#writer.set(undefined);
    }
  }

  ngOnDestroy(): void {
    this.#controller.abort();
    this.#destroyWriter();
  }
}

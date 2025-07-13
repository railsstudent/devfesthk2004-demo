import { WritableSignal } from '@angular/core';

export function streamTextUtil() {
  return function (stream: ReadableStream<string>, chunk: WritableSignal<string>, 
    done: WritableSignal<boolean | undefined>, resource?: { destroy(): void }) {
    const reader = stream.getReader();

    chunk.set('');
    done.set(false);

    reader.read()
      .then(function processText({ value, done: status }): any {
          if (status) {
            done.set(status);
            return;
          }

          chunk.update((prev) => prev + value);
          return reader.read().then(processText);
      })
      .catch((err) => {
          console.error(err);
          if (err instanceof Error) {
              throw err;
          }
          throw new Error('Error in streaming the draft.');
      })
      .finally(() => {
        if (resource) {
          resource.destroy();
          console.log('Destroying the resource.');
        }
      });
  }
}
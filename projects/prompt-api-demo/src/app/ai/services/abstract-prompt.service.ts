import { computed, signal } from '@angular/core';

export abstract class AbstractPromptService {
    controller = new AbortController();
    #session = signal<LanguageModel | undefined>(undefined);
    session = this.#session.asReadonly();
    #options = signal<LanguageModelCreateOptions | undefined>(undefined);
    #chunk = signal({ value: '', sequence: 0, done: false });
    chunk = this.#chunk.asReadonly();

    resetSession(newSession: LanguageModel | undefined) {
        this.#session.set(newSession);
    }

    #inputQuota = computed(() => this.#session()?.inputQuota || 0);
    #inputUsage = signal(0);
    #tokenLeft = computed(() => this.#inputQuota() - this.#inputUsage());

    tokenContext = computed(() => {
        return {
            tokensSoFar: this.#inputUsage(),
            maxTokens: this.#inputQuota(),
            tokensLeft: this.#tokenLeft(),
        }
    });

    setPromptOptions(options?: LanguageModelCreateOptions) {
        this.#options.set(options);
    }

    async createSessionIfNotExists(): Promise<void> {
        if (!this.#session()) {
            const newSession = await this.createPromptSession(this.#options());
            if (!newSession) {
                throw new Error('Prompt API failed to create a session.');
            }
            this.resetSession(newSession);
            this.updateTokenContext()
        }
    }

    abstract createPromptSession(options?: LanguageModelCreateOptions): Promise<LanguageModel | undefined>;

    async prompt(query: string): Promise<void> {
        await this.createSessionIfNotExists();
        const session = this.#session();
        if (!session) {
            throw new Error('Session does not exist.');
        }

        this.#chunk.set({ value: '', sequence: -1, done: false });
        const stream = await session.promptStreaming(query);
        const self = this;
        const reader = stream.getReader();
        let sequence = 0;
        reader.read().then(function processText({ done, value }): any {
            // console.log('done', done, 'value', value);
            if (done) {
                self.#chunk.set({ value: '', sequence, done });
                self.updateTokenContext();
                return;
            }

            if (value) {
                self.#chunk.set({ value, sequence, done });
                sequence = sequence + 1;
            }
            return reader.read().then(processText);
        });
    }

    updateTokenContext() {
        const session = this.session();
        if (session) {
            this.#inputUsage.set(session.inputUsage);
        }
    }

    async countNumTokens(query: string): Promise<number> {
        await this.createSessionIfNotExists();
        const session = this.#session();
        if (!session) {
            return Promise.resolve(0);
        }

        return session.measureInputUsage(query);
    }

    destroySession() {
        const session = this.session();

        if (session) {
            session.destroy();
            console.log('Destroy the prompt session.');
            this.resetSession(undefined);
        }
    }
}

import { computed, signal } from '@angular/core';

export abstract class AbstractPromptService {
    controller = new AbortController();
    #session = signal<LanguageModel | undefined>(undefined);
    session = this.#session.asReadonly();
    #options = signal<LanguageModelCreateOptions | undefined>(undefined);
    
    #chunk = signal('');
    chunk = this.#chunk.asReadonly();
    
    #isLoading = signal(false);
    isLoading = this.#isLoading.asReadonly();

    #error = signal('');
    error = this.#error.asReadonly();

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

        this.#error.set('');
        this.#isLoading.set(true);
        this.#chunk.set('');
        const stream = await session.promptStreaming(query);
        const self = this;
        const reader = stream.getReader();
        reader.read()
            .then(function processText({ done, value }): any {
                if (done) {
                    self.#chunk.set(value || '');
                    self.updateTokenContext();
                    return;
                }

                self.#chunk.set(value);
                return reader.read().then(processText);
            })
            .catch((e) => {
                const errMsg = e instanceof Error ? (e as Error).message : 'Error in prompt';
                this.#error.set(errMsg);
            })
            .finally(() => {
                this.#isLoading.set(false);
            })
    }

    updateTokenContext() {
        const session = this.session();
        if (session) {
            this.#inputUsage.set(session.inputUsage);
        }
    }

    async countNumTokens(query: string): Promise<number> {
        try {
            this.#error.set('');
            await this.createSessionIfNotExists();
            const session = this.#session();
            if (!session) {
                return Promise.resolve(0);
            }

            return session.measureInputUsage(query);
        } catch (e) {
            const errMsg = e instanceof Error ? (e as Error).message : 'Error in countNumTokens';
            this.#error.set(errMsg);
            return -1;
        }
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

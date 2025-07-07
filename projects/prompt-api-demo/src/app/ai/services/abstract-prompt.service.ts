import { computed, signal } from '@angular/core';
import { ChunkType } from '../types/chunk.type';

export abstract class AbstractPromptService {
    controller = new AbortController();
    #session = signal<LanguageModel | undefined>(undefined);
    session = this.#session.asReadonly();
    #options = signal<LanguageModelCreateOptions | undefined>(undefined);
    
    #chunk = signal<ChunkType>({ 
        done: false 
    });
    chunk = this.#chunk.asReadonly();
    
    #isLoading = signal(false);
    isLoading = this.#isLoading.asReadonly();

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

        this.#isLoading.set(true);
        this.#chunk.set({ done: false });
        const stream = await session.promptStreaming(query);
        const self = this;
        const reader = stream.getReader();
        let sequence = 0;
        reader.read().then(function processText({ done, value }): any {
            if (done) {
                self.#chunk.set({ sequence, done });
                self.updateTokenContext();
                self.#isLoading.set(false);
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
        try {
            this.#isLoading.set(true);
            await this.createSessionIfNotExists();
            const session = this.#session();
            if (!session) {
                return Promise.resolve(0);
            }

            return session.measureInputUsage(query);
        } finally {
            this.#isLoading.set(false);
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

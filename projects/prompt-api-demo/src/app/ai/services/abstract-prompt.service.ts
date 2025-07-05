import { computed, signal } from '@angular/core';

export abstract class AbstractPromptService {
    controller = new AbortController();
    #session = signal<LanguageModel | undefined>(undefined);
    session = this.#session.asReadonly();
    #options = signal<LanguageModelCreateOptions | undefined>(undefined);

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

    shouldCreateSession() {
        const session = this.#session();
        return !session || this.#tokenLeft() < 500;
    }

    setPromptOptions(options?: LanguageModelCreateOptions) {
        this.#options.set(options);
    }

    async createSessionIfNotExists(): Promise<void> {
        if (this.shouldCreateSession()) {
            this.destroySession();
            const newSession = await this.createPromptSession(this.#options());
            if (!newSession) {
                throw new Error('Prompt API failed to create a session.');       
            }
            this.resetSession(newSession);
            this.updateTokenContext()
        } 
    }

    abstract createPromptSession(options?: LanguageModelCreateOptions): Promise<LanguageModel | undefined>;

    async prompt(query: string): Promise<string> {
        await this.createSessionIfNotExists();
        const session = this.#session();
        if (!session) {
            throw new Error('Session does not exist.');       
        }
        const answer = await session.prompt(query);
        this.updateTokenContext();
        console.log('prompt -> session', this.session());
        return answer;
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

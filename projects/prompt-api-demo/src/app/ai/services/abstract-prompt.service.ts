import { inject, signal } from '@angular/core';
import { AI_PROMPT_API_TOKEN } from '../constants/core.constant';
import { ERROR_CODES } from '../enums/error-codes.enum';
import { PromptOptions, Tokenization } from '../types/prompt.type';

export abstract class AbstractPromptService {
    promptApi = inject(AI_PROMPT_API_TOKEN);
    #session = signal<AILanguageModel | undefined>(undefined);
    session = this.#session.asReadonly();
    #tokenContext = signal<Tokenization | null>(null);
    tokenContext = this.#tokenContext.asReadonly();
    #options = signal<PromptOptions | undefined>(undefined);

    resetSession(newSession: AILanguageModel | undefined) {
        this.#session.set(newSession);
        this.#tokenContext.set(null);
    }

    shouldCreateSession() {
        const session = this.#session();
        const context = this.#tokenContext();
        return !session || (context && context.tokensLeft < 500);
    }

    setPromptOptions(options?: PromptOptions) {
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
        } 
    }

    abstract createPromptSession(options?: PromptOptions): Promise<AILanguageModel | undefined>;

    async prompt(query: string): Promise<string> {
        if (!this.promptApi) {
            throw new Error(ERROR_CODES.NO_PROMPT_API);
        }

        await this.createSessionIfNotExists();
        const session = this.#session();
        if (!session) {
            throw new Error('Session does not exist.');       
        }
        const answer = await session.prompt(query);
        this.#tokenContext.set({
            tokensSoFar: session.tokensSoFar,
            maxTokens: session.maxTokens,
            tokensLeft: session.tokensLeft,
        });

        return answer;
    }

    async countNumTokens(query: string): Promise<number> {
        await this.createSessionIfNotExists();
        const session = this.#session();
        if (!session) {
            return Promise.resolve(0);
        }

        return session.countPromptTokens(query);
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

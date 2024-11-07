import { inject, signal } from '@angular/core';
import { AI_TRANSLATION_API_TOKEN } from '../constants/core.constant';
import { Tokenization } from '../types/prompt.type';

export abstract class AbstractPromptService {
    promptApi = inject(AI_TRANSLATION_API_TOKEN);
    #session = signal<any | null>(null);
    session = this.#session.asReadonly();
    #tokenContext = signal<Tokenization | null>(null);
    tokenContext = this.#tokenContext.asReadonly();

    resetSession(newSession: any) {
        this.#session.set(newSession);
        this.#tokenContext.set(null);
    }

    async prompt(query: string): Promise<string> {
        if (!this.promptApi) {
        throw new Error(`Your browser doesn't support the Prompt API. If you are on Chrome, join the Early Preview Program to enable it.`);
        }

        const session = this.session();
        if (!session) {
            throw new Error('Failed to create AITextSession.');
        }

        this.#tokenContext.set(null);
        const answer = await session.prompt(query);
        this.#tokenContext.set({
            tokensSoFar: session.tokensSoFar as number,
            maxTokens: session.maxTokens as number,
            tokensLeft: session.tokensLeft as number,
        });

        return answer;
    }

    countNumTokens(query: string): Promise<number> {
        if (!this.#session) {
            return Promise.resolve(0);
        }

        const session = this.#session();
        return session.countPromptTokens(query) as Promise<number>;
    }

    destroySession() {
        const session = this.session();

        if (session) {
            session.destroy();
            console.log('Destroy the prompt session.');
            this.resetSession(null);
        }
    }
}

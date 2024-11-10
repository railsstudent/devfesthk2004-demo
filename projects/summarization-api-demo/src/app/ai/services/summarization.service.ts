import { inject, signal } from '@angular/core';
import { AI_SUMMARIZATION_API_TOKEN } from '../constants/core.constant';

export class SummarizationService {
    promptApi = inject(AI_SUMMARIZATION_API_TOKEN);
    #session = signal<any | null>(null);
    session = this.#session.asReadonly();

    resetSession(newSession: any) {
        this.#session.set(newSession);
    }

    async prompt(query: string): Promise<string> {
        if (!this.promptApi) {
        throw new Error(`Your browser doesn't support the Prompt API. If you are on Chrome, join the Early Preview Program to enable it.`);
        }

        const session = this.session();
        if (!session) {
            throw new Error('Failed to create AITextSession.');
        }

        const answer = await session.prompt(query);
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

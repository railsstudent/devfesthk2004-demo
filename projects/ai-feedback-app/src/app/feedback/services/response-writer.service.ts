import { inject, Injectable } from '@angular/core';
import { SystemPromptService } from '../../ai/services/system-prompts.service';

@Injectable({
    providedIn: 'root'
})
export class ResponseWriterService {
    #promptService = inject(SystemPromptService);

    generateDraft(query: string, sentiment: string ): Promise<string> {
        return this.#promptService.prompt(query, sentiment)
            .then((promptResult) => promptResult)
            .catch((e) => {
                const errMsg = e instanceof Error ? e.message : 'Error in finding the sentiment.';
                throw new Error(errMsg);
            });
    }

    destroySessions() {
        this.#promptService.destroySession();
    }
}

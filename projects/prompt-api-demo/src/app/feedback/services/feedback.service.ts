import { inject, Injectable, signal } from '@angular/core';
import { PromptService } from '../../ai/services/prompt.service';
import { FeedbackType } from '../types/feedback-state.type';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  promptService = inject(PromptService);

  state = signal<FeedbackType>({
    prompt: '',
    response: '',
  })

  async generateReply(query: string): Promise<void> {
    this.state.set({
      prompt: '',
      response: '',
    })

    const responsePrompt = `
      Feedback: ${query} 
    `;

    const answer = await this.promptService.prompt(responsePrompt);

    this.state.set({
      prompt: responsePrompt,
      response: answer,
    })
  }
}

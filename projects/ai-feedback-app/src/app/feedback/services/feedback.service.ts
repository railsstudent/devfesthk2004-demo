import { inject, Injectable, signal } from '@angular/core';
import { FeedbackType } from '../types/feedback-state.type';
import { NShotPromptService } from '../../ai/services/n-shot-prompt.service';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  promptService = inject(NShotPromptService);

  state = signal<FeedbackType>({
    language: '',
    prompt: '',
    response: '',
  })

  async generateReply(query: string): Promise<void> {
    this.state.set({
      language: '',
      prompt: '',
      response: '',
    })

    // const sentiment = categories[0].sentiment;
    // const responsePrompt = `
    //   The customer wrote a ${sentiment} feedback in ${language}. 
    //   Please write the response in one paragraph in ${language}, 100 words max.
    //   Feedback: ${query} 
    // `;

    const responsePrompt = ``;

    const answer = await this.promptService.prompt(responsePrompt);

    // this.state.set({
    //   // categories,
    //   language,
    //   prompt: responsePrompt,
    //   response: answer,
    // })
  }
}

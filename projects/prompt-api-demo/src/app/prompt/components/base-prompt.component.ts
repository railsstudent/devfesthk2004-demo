import { computed, Directive, inject, signal } from '@angular/core';
import { AbstractPromptService } from '../../ai/services/abstract-prompt.service';
import { State } from '../types/prompt-response.type';

@Directive({
    standalone: false
})
export abstract class BasePromptComponent {
    promptService = inject(AbstractPromptService);
  
    session = this.promptService.session;
    value = this.promptService.chunk;
    isLoading = this.promptService.isLoading;
    error = this.promptService.error;
    
    query = signal('Tell me about the job responsibility of an A.I. engineer, maximum 500 words.');
    numPromptTokens = signal(0);
    
    state = computed<State>(() => {
        const isLoading = this.isLoading();
        const isUnavailableForCall = isLoading || this.query().trim() === '';
        return {
            status: isLoading ? 'Processing...' : 'Idle',
            text: isLoading ? 'Progressing...' : 'Submit',
            disabled: isLoading,
            numTokensDisabled: isUnavailableForCall,
            submitDisabled: isUnavailableForCall,
        }
    });

    private async countPromptTokens() {
      const numTokens = await this.promptService.countNumTokens(this.query());
      this.numPromptTokens.set(numTokens);
    }
    
    async submitPrompt() {
      const promises = [this.countPromptTokens(), this.promptService.prompt(this.query())];
      await Promise.all(promises);
    }
  }
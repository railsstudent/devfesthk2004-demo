import { computed, Directive, inject, signal } from '@angular/core';
import { AbstractPromptService } from '../../ai/services/abstract-prompt.service';

@Directive({
    standalone: false
})
export abstract class BasePromptComponent {
    promptService = inject(AbstractPromptService);
  
    session = this.promptService.session;
    
    isLoading = signal(false);
    error = signal('');
    query = signal('Tell me about the job responsibility of an A.I. engineer, maximum 500 words.');
    response = signal('');
    numPromptTokens = signal(0);
    
    state = computed(() => {
        const isLoading = this.isLoading();
        const session = this.session();
        const isNoSessionOrBusy = !this.session() || this.isLoading();
        const isUnavailableForCall = isNoSessionOrBusy || this.query().trim() === '';
        return {
            status: isLoading ? 'Processing...' : 'Idle',
            text: isLoading ? 'Progressing...' : 'Submit',
            disabled: isLoading,
            destroyDisabled: !session || isLoading,
            numTokensDisabled: isUnavailableForCall,
            submitDisabled: isUnavailableForCall
        }
    });

    destroySession() {
      try {
        this.isLoading.set(true);
        this.promptService.destroySession();
      } catch(e) {
        const errMsg = e instanceof Error ? (e as Error).message : 'Error in destroySession';
        this.error.set(errMsg);
      } finally {
        this.isLoading.set(false);
      }
    }
  
    async countPromptTokens() {
      try {
        this.isLoading.set(true);
        const numTokens = await this.promptService.countNumTokens(this.query());
        this.numPromptTokens.set(numTokens);
      } catch(e) {
        const errMsg = e instanceof Error ? (e as Error).message : 'Error in countPromptTokens';
        this.error.set(errMsg);
      } finally {
        this.isLoading.set(false);
      }
    }
  
    async submitPrompt() {
      try {
        this.isLoading.set(true);
        this.error.set('');
        this.response.set('');
        const answer = await this.promptService.prompt(this.query());
        this.response.set(answer);
      } catch(e) {
        const errMsg = e instanceof Error ? (e as Error).message : 'Error in submitPrompt';
        this.error.set(errMsg);
      } finally {
        this.isLoading.set(false);
      }
    }
  }
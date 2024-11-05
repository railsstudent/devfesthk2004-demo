import { Directive, inject, signal } from '@angular/core';
import { AbstractPromptService } from '../../ai/services/abstract-prompt.service';

@Directive({})
export abstract class BasePromptComponent {
    promptService = inject(AbstractPromptService);
  
    session = this.promptService.session;
    
    isLoading = signal(false);
    error = signal('');
    query = signal('');
    response = signal('');
    numPromptTokens = signal(0);
    
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
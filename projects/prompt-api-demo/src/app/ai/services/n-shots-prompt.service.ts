import { Injectable, OnDestroy } from '@angular/core';
import { AbstractPromptService } from './abstract-prompt.service';

@Injectable({
  providedIn: 'root'
})
export class NShotsPromptService extends AbstractPromptService implements OnDestroy  {
  override async createPromptSession(options?: LanguageModelCreateOptions): Promise<LanguageModel | undefined> {
    const { initialPrompts = undefined } = options || {};
    return LanguageModel.create({ initialPrompts, signal: this.controller.signal });
  }

  ngOnDestroy(): void {
    this.controller.abort();
    this.destroySession();
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeedbackService } from './services/feedback.service';
import { CapabilityComponent } from '../prompt/capability.component';
import { PromptService } from '../ai/services/prompt.service';

@Component({
  selector: 'app-feedback-input',
  standalone: true,
  imports: [FormsModule, CapabilityComponent],
  template: `
    <app-capability />
    <label class="label" for="input">Input customer feedback: </label>
    <textarea rows="8" id="input" name="input" [(ngModel)]="feedback"></textarea>
    <button (click)="submit()" [disabled]="buttonState().disabled">{{ buttonState().text }}</button>
    @let state = feedbackState();
    <div>
      <p>
        <span class="label">Prompt: </span>{{ state.prompt }}
      </p>
    </div>
    <div>
      <span class="label">Response:</span>
      <p>{{ state.response }}</p>
    </div>
    <div>
      @if (error()) {
        <p>Error: {{ error() }}</p>
      }
    </div>
  `,
  styles: `
    textarea {
      width: 100%;
    }

    button {
      margin-bottom: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackInputComponent {
  feedbackService = inject(FeedbackService);
  promptService = inject(PromptService);

  feedback = signal('', { equal: () => false });
  isLoading = signal(false);

  feedbackState = this.feedbackService.state;
  error = signal('');

  buttonState = computed(() => {
    return {
      text: this.isLoading() ? 'Processing...' : 'Submit',
      disabled: this.isLoading() || this.feedback().trim() === ''  
    }    
  })  

  constructor() {
    this.promptService.getCapabilities();
  }
  
  async submit() {
    this.isLoading.set(true);
    this.error.set('');
    try {
      await this.feedbackService.generateReply(this.feedback());
    } catch (e) {
      if (e instanceof Error) {
        this.error.set((e as Error).message);
      } else {
        this.error.set('Error in prompt service');
      }
    } finally {
      this.isLoading.set  (false);
    }
  }
}

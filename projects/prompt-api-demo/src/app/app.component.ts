import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DetectAIComponent } from './detect-ai.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DetectAIComponent],
  template: `
    <h2>Generate Response for Customer Feedback</h2>
    <h3>Use MediaPipe Text Classifier and Language Detection Tasks, and Chrome Built-In Prompt AI to generate reply</h3>
    <app-detect-ai />
  `,
  styles: `
    :host {
      display: block;
      padding-left: 1rem;
      padding-right: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}

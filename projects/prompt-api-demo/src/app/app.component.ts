import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DetectAIComponent } from './detect-ai.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DetectAIComponent],
  template: `
    <h2>Chrome Built-in Prompt API </h2>
    <h3>Use ai.assistant (Pre-131.0.6776.0) or ai.languageModel (Post-131.0.6776.0) to prompt model to generate text.</h3>
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

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DetectAIComponent } from './detect-ai.component';

@Component({
    selector: 'app-root',
    imports: [DetectAIComponent],
    template: `
    <h2>Generate Response for Customer Feedback</h2>
    <h3>Use Chrome Built-In Prompt, Language Detection, and Translation APIs</h3>
    <app-detect-ai />
  `,
    styles: `
    :host {
      display: block;
      padding-left: 1rem;
      padding-right: 1rem;
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}

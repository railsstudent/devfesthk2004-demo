import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DetectAIComponent } from './detect-ai.component';

@Component({
    selector: 'app-root',
    imports: [DetectAIComponent],
    template: `
    <h2>Chrome Built-in Summarization API </h2>
    <app-detect-ai [showUserAgent]="showUserAgent()" />
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
export class AppComponent {
  showSetup = signal(false);
  showUserAgent = signal(false);
}


import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DetectAIComponent } from './detect-ai.component';
import { SetupComponent } from './summarization/components/setup.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DetectAIComponent, SetupComponent],
  template: `
    <h2>Chrome Built-in Summarization API </h2>
    <div style="margin-bottom: 0.5rem;">
      @let btnSetupText = showSetup() ? 'Hide Setup' : 'Show Setup';
      @let btnUserAgentText = showUserAgent() ? 'Hide User Agent' : 'Show User Agent';
      <button style="margin-right: 0.25rem;" (click)="showSetup.set(!showSetup())">{{ btnSetupText }}</button>
      <button (click)="showUserAgent.set(!showUserAgent())">{{ btnUserAgentText }}</button>
    </div>
    @if (showSetup()) {
      <app-setup />
    }
    <app-detect-ai [showUserAgent]="showUserAgent()" />
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
export class AppComponent {
  showSetup = signal(false);
  showUserAgent = signal(false);
}


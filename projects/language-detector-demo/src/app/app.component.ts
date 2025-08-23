import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DetectAIComponent } from './detect-ai.component';

@Component({
    selector: 'app-root',
    imports: [DetectAIComponent],
    template: `
    <h2>Chrome Built-in Language Detector API </h2>
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

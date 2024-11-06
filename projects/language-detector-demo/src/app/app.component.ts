import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  template: '<p>Test</p>',
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

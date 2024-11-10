import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-summarizer-capabilities',
  imports: [],
  template: `
    <button (click)="show.set(!show()) ">{{ show() ? 'Hide' : 'Show' }} Capabilities</button>
    @if (show()) {
      <div class="container">
        <div>
          <h4>Supported Types</h4>
          @for (format of supportedTypes(); track $index) {
            <p>{{ format }}</p> 
          }
        </div>
        <div>
          <h4>Supported Formats</h4>
          @for (format of supportedFormats(); track $index) {
            <p>{{ format }}</p> 
          }
        </div>
        <div>
          <h4>Supported Length</h4>
          @for (format of supportedLength(); track $index) {
            <p>{{ format }}</p> 
          }
        </div>
        <div>
          <h4>Available Language</h4>
          @for (format of languageAvailable(); track $index) {
            <p>{{ format }}</p> 
          }
        </div>
      </div>
      <hr />
    }
  `,
  styles: `
    .container {
      display: flex;
      flex-wrap: wrap;
    }

    .container > div {
      flex-basis: 33.33%; 
      flex-grow: 1; 
      flex-shrink: 1;
    }

    .container > div > p {
      line-height: 1.25rem;
    }

    h4 {
      text-decoration: underline; 
      font-style: italic;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummarizerCapabilitiesComponent {
  supportedFormats = input.required<string[]>();
  supportedTypes = input.required<string[]>();
  supportedLength = input.required<string[]>();
  languageAvailable = input.required<string[]>();

  show = signal(true)
}

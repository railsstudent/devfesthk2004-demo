import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-capability',
  standalone: true,
  template: `
    @let capabilities = defaultCapabilities();
    @if (capabilities) {
      <h3>Capabilities Detection</h3>
      <div style="display: flex; justify-content: space-between">
        <span class="label">Default Temperature: {{ capabilities.defaultTemperature }}</span>
        <span class="label">Max. Temperature: {{ capabilities.maxTemperature }}</span>
        <span class="label">Default TopK: {{ capabilities.defaultTopK }}</span>
        <span class="label">Max. TopK: {{ capabilities.maxTopK }}</span>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CapabilityComponent {
  defaultCapabilities = input.required<LanguageModelParams | undefined>();
}

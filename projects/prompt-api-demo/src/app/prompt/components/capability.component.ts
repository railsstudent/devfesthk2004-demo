import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-capability',
  standalone: true,
  template: `
    @if (isReady()) {
      @let capabilities = defaultCapabilities();
      <h3>Capabilities Detection</h3>
      <div style="display: flex; justify-content: space-between">
        <span class="label">Default Temperature: {{ capabilities.defaultTemperature }}</span>
        <span class="label">Default TopK: {{ capabilities.defaultTopK }}</span>
        <span class="label">Default max TopK: {{ capabilities.maxTopK }}</span>
      </div>
    } @else {
      <div>
        <p>The model of the Prompt API is not implemented. Please check your configuration in chrome://flags/#optimization-guide-on-device-model</p>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CapabilityComponent {
  defaultCapabilities = input.required<AILanguageModelCapabilities>();
  
  isReady = computed(() => this.defaultCapabilities().available === 'readily');
}

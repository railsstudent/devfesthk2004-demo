import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CAPABILITIES_AVAILABLE } from '../ai/enums/capabilities-available.enum';
import { LanguageModelCapabilities } from '../ai/types/language-model-capabilties.type';

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
  defaultCapabilities = input.required<LanguageModelCapabilities>();
  
  isReady = computed(() => this.defaultCapabilities().available === CAPABILITIES_AVAILABLE.READILY);
}

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PromptService } from '../ai/services/prompt.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CAPABILITIES_AVAILABLE } from '../ai/enums/capabilities-available.enum';
import { LanguageModelCapabilities } from '../ai/types/language-model-capabilties.type';

const INIT_CAPABILITIES = {
  available: CAPABILITIES_AVAILABLE.NO,
  defaultTemperature: 0,
  defaultTopK: 0,
  maxTopK: 0,
}

@Component({
  selector: 'app-capability',
  standalone: true,
  imports: [],
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
  promptService = inject(PromptService);
  defaultCapabilities = toSignal(this.promptService.getCapabilities(), 
    { initialValue: INIT_CAPABILITIES as LanguageModelCapabilities });

  isReady = computed(() => this.defaultCapabilities().available === CAPABILITIES_AVAILABLE.READILY);
}

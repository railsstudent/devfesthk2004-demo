import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { INIT_CAPABILITIES } from '../ai/constants/capabilities.constant';
import { ZeroPromptService } from '../ai/services/zero-prompt.service';
import { CapabilityComponent } from './components/capability.component';
import { NShotPromptComponent } from './components/n-shot-prompt.component';
import { SystemPromptsComponent } from './components/system-prompts.component';
import { ZeroPromptComponent } from './components/zero-prompt.component';

@Component({
    selector: 'app-prompt-showcase',
    imports: [FormsModule, CapabilityComponent, NgComponentOutlet],
    template: `
    <app-capability [defaultCapabilities]="defaultCapabilities()" />
    <label>Demo: </label>
    <select [(ngModel)]="selectedDemo" style="margin-bottom: 1rem;">
      @for (demo of demos(); track demo) {
        <option [ngValue]="demo">{{ demo }}</option>
      }
    </select>
    @let outlet = componentOutlet();
    <ng-container [ngComponentOutlet]="outlet.component" [ngComponentOutletInputs]="outlet.inputs" />
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromptShowcaseComponent {
  ZeroPromptComponent = ZeroPromptComponent;
  SystemPromptsComponent = SystemPromptsComponent;

  promptService = inject(ZeroPromptService);

  demos = signal([
    'Zero-shot prompting',
    'Per session Option',
    'System Prompts',
    'N-shot prompting',
  ]);
  selectedDemo = signal(this.demos()[0]);
  
  componentOutlet = computed(() => {
    const selection = this.selectedDemo();
    const demos = this.demos();
    if (selection ===  demos[0]) {
      return { 
        component: ZeroPromptComponent,
        inputs: { 
          isPerSession: false
        }
      };
    } else if (selection === demos[1]) {
      return { 
        component: ZeroPromptComponent,
        inputs: { 
          isPerSession: true
        }
      }; 
    } else if (selection === demos[2]) {
      return { 
        component: SystemPromptsComponent,
        inputs: {}
      }; 
    }
    return {
      component: NShotPromptComponent,
      inputs: {}
    }
  });
 
  defaultCapabilities = toSignal(this.promptService.getCapabilities(), 
    { initialValue: INIT_CAPABILITIES as AILanguageModelCapabilities });
}

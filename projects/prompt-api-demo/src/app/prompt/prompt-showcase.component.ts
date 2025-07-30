import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ZeroPromptService } from '../ai/services/zero-prompt.service';
import { CapabilityComponent } from './components/capability.component';
import { NShotsPromptComponent } from './components/n-shots-prompt.component';
import { SystemPromptsComponent } from './components/system-prompts.component';
import { ZeroPromptComponent } from './components/zero-prompt.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-prompt-showcase',
    imports: [FormsModule, CapabilityComponent, NgComponentOutlet],
    template: `
    <app-capability [defaultCapabilities]="defaultCapabilities()" />
    <label>Demo: </label>
    <select [(ngModel)]="selectedDemo" style="margin-bottom: 1rem;">
      @for (demo of demos(); track demo.name) {
        <option [ngValue]="demo">{{ demo.name }}</option>
      }
    </select>
    @let outlet = componentOutlet();
    <ng-container [ngComponentOutlet]="outlet.component" [ngComponentOutletInputs]="outlet.inputs" />
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromptShowcaseComponent {
  promptService = inject(ZeroPromptService);

  demos = signal([
    { name: 'Per session Option', component: ZeroPromptComponent, isPerSession: true },
    { name: 'Zero-shot prompting', component: ZeroPromptComponent, },
    { name: 'System Prompts', component: SystemPromptsComponent },
    { name: 'N-shot prompting', component: NShotsPromptComponent },
  ]);
  selectedDemo = signal(this.demos()[0]);
  
  componentOutlet = computed(() => {
    const { component, isPerSession = false } = this.selectedDemo();
    const inputs = component === ZeroPromptComponent ? { isPerSession } : {}
    
    return { 
      component,
      inputs: {
        ...inputs,
        defaultCapabilities: this.defaultCapabilities(),
      }
    }; 
  });

  defaultCapabilities = toSignal(this.promptService.getCapabilities());
}

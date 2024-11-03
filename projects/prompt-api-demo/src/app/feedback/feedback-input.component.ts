import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { INIT_CAPABILITIES } from '../ai/constants/capabilities.constant';
import { ZeroPromptService } from '../ai/services/zero-prompt.service';
import { LanguageModelCapabilities } from '../ai/types/language-model-capabilties.type';
import { CapabilityComponent } from '../prompt/capability.component';
import { ZeroPromptComponent } from '../prompt/zero-prompt.component';

@Component({
  selector: 'app-feedback-input',
  standalone: true,
  imports: [FormsModule, CapabilityComponent, NgComponentOutlet],
  template: `
    <app-capability [defaultCapabilities]="defaultCapabilities()" />
    <label>Demo: </label>
    <select [(ngModel)]="selectedDemo">
      @for (demo of demos(); track $index) {
        <option [ngValue]="demo">{{ demo }}</option>
      }
    </select>
    <ng-container *ngComponentOutlet="ZeroPromptComponent" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackInputComponent {
  ZeroPromptComponent = ZeroPromptComponent;
  promptService = inject(ZeroPromptService);

  demos = signal([
    'Zero-shot prompting',
    'System Prompts',
    'N-shot prompting',
    'Per session Option',
  ]);
  selectedDemo = signal(this.demos()[0]);
  
  componentLoaded = computed(() => {
    const selection = this.selectedDemo();
    const demos = this.demos();
    if (selection ===  demos[0]) {
      return ZeroPromptComponent;
    }
    return ZeroPromptComponent;
  })
 
  defaultCapabilities = toSignal(this.promptService.getCapabilities(), 
    { initialValue: INIT_CAPABILITIES as LanguageModelCapabilities });
}

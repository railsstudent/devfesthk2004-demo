import { NgTemplateOutlet } from '@angular/common';
import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, model, output, Renderer2, TemplateRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ParserService } from '../../ai/services/parser.service';
import { PromptResponse } from '../types/prompt-response.type';
import { TokenizationComponent } from './tokenization.component';

const transform = (value: TemplateRef<any> | undefined) => typeof value === 'undefined' ? null : value;

@Component({
  selector: 'app-prompt-response',
  imports: [TokenizationComponent, FormsModule, NgTemplateOutlet],
  template: `
    @let responseState = state();
    <app-tokenization [state]="responseState"  />
    @if (perSessionTemplate()) {
      <ng-container [ngTemplateOutlet]="perSessionTemplate()" [ngTemplateOutletContext]="perSessionTemplateContext()" />
    }
    <div>
      <span class="label" for="input">Prompt: </span>
      <textarea id="input" name="input" [(ngModel)]="query" [disabled]="responseState.disabled" rows="3"></textarea>
    </div>
    <button (click)="askAIModel()" [disabled]="responseState.submitDisabled">{{ responseState.text }}</button>
    <div>
      <span class="label">Response: </span>
      <div #answer style="font-size: 1.25rem;"></div>
    </div>
    @let error = responseState.error;
    @if (error) {
      <div>
        <span class="label">Error: </span>
        <p>{{ error }}</p>
      </div>
    }
  `,
  styleUrl: './prompt.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromptResponseComponent {
  state = input.required<PromptResponse>();
  query = model.required<string>();
  perSessionTemplate = input(null,{ transform });
  perSessionTemplateContext = input<any | undefined>(undefined);

  submitPrompt = output();

  answer = viewChild.required<ElementRef<HTMLDivElement>>('answer');
  element = computed(() => this.answer().nativeElement);

  renderer = inject(Renderer2);
  parserService = inject(ParserService)

  constructor() {
    afterRenderEffect({
      write: () => this.parserService.writeToElement(this.state().value || '')
    });
  }

  askAIModel() {
    const element = this.element();
    if (element.lastChild) {
      this.renderer.setProperty(element, 'innerHTML', '');
    }
    this.parserService.resetParser(element);
    this.submitPrompt.emit();
  }
}

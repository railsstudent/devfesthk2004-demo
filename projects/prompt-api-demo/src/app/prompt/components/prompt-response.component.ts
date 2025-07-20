import { NgTemplateOutlet } from '@angular/common';
import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, linkedSignal, model, output, Renderer2, TemplateRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import DOMPurify from 'dompurify';
import * as smd from 'streaming-markdown';
import { ParserService } from '../../ai/services/parser.service';
import { ParseStreamedResponse, PromptResponse } from '../types/prompt-response.type';
import { TokenizationComponent } from './tokenization.component';

const transform = (value: TemplateRef<any> | undefined) => typeof value === 'undefined' ? null : value;

@Component({
  selector: 'app-prompt-response',
  imports: [TokenizationComponent, FormsModule, NgTemplateOutlet],
  template: `
    @let responseState = state();
    <app-tokenization [numPromptTokens]="responseState.numPromptTokens" [tokenContext]="responseState.tokenContext" />
    <div>
      <span class="label">Status: </span><span>{{ responseState.status }}</span>
    </div>
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
      <div #answer></div>
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

  parser = computed(() => {
    const renderer = smd.default_renderer(this.element());
    return smd.parser(renderer);
  });

  streamedResponse = linkedSignal<PromptResponse, ParseStreamedResponse>({
    source: () => this.state(),
    computation: (source, previous) => {
      const { value = '', sequence, done } = source.chunk;
      if (typeof sequence === 'undefined') {
        return { 
          chunk: '',
          chunks: '',
          done: false,
        };
      }

      const p = previous?.value || { chunk: '', chunks: '' };
      return { 
        chunk: value,
        chunks: `${p.chunks}${value}`,
        sequence,
        done,
      }; 
    }
  });

  renderMarkdown = input(true);

  renderer = inject(Renderer2);
  parserService = inject(ParserService)

  constructor() {
    afterRenderEffect({
      write: () => {
      const { chunk, chunks } = this.streamedResponse();

      if (!this.renderMarkdown()) {
        this.element().append(chunk);
        return;
      }

        const parser = this.parser();
        DOMPurify.sanitize(chunks);
        if (DOMPurify.removed.length) {
          smd.parser_end(parser);
          return;
        }

        smd.parser_write(parser, chunk);
      }
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

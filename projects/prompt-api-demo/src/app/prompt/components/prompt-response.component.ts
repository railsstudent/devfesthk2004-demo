import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, linkedSignal, model, output, TemplateRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import DOMPurify from 'dompurify';
import * as smd from 'streaming-markdown';
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
      <ng-container *ngTemplateOutlet="perSessionTemplate(); context: perSessionTemplateContext()" />
    }
    <div>
      <span class="label" for="input">Prompt: </span>
      <textarea id="input" name="input" [(ngModel)]="query" [disabled]="responseState.disabled" rows="3"></textarea>
    </div>
    <button (click)="countPromptTokens.emit()" [disabled]="responseState.numTokensDisabled">Count Prompt Tokens</button>
    <button (click)="submitPrompt.emit()" [disabled]="responseState.submitDisabled">{{ responseState.text }}</button>
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

  countPromptTokens = output();
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
      const { value, sequence, done } = source.chunk;
      if (sequence === -1) {
        return { 
          chunk: '',
          chunks: '',
          sequence,
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

  constructor() {
    effect(() => {
      const { chunk, chunks, sequence, done } = this.streamedResponse();

      if (sequence === -1) {
        const element = this.element();
        while (element.lastChild) {
          element.removeChild(element.lastChild as ChildNode);
        } 
      }

      if (!this.renderMarkdown()) {
        this.element().append(chunk);
        return;
      }

      const parser = this.parser();
      DOMPurify.sanitize(chunks);
      if (DOMPurify.removed.length) {
        // If the output was insecure, immediately stop what you were doing.
        // Reset the parser and flush the remaining Markdown.
        smd.parser_end(parser);
        return;
      }

      if (!done) {
        smd.parser_write(parser, chunk);
      } else {
        smd.parser_end(parser);
      }
    });
  }
}

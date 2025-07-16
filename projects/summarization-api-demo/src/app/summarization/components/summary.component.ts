import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, output, Renderer2, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import DOMPurify from 'dompurify';
import * as smd from 'streaming-markdown';
import data from '../data/description.json';

@Component({
    selector: 'app-summary',
    imports: [FormsModule],
    template: `
    <label for="content">Content:</label>
    <textarea id="content" name="content" rows="20" [(ngModel)]="text"></textarea>
    <div>
      @let buttonText = isSummarizing() ? 'Summarizing...' : 'Summarize';
      @let disabled = text().trim() === '' || isSummarizing();
      <button (click)="requestSummary()" [disabled]="disabled">{{ buttonText }}</button>
    </div>
    @if (!error()) {
      <div #answer></div>
    }
  `,
    styles: `
    input {
      width: 100%;
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class SummaryComponent {
    renderer = inject(Renderer2);
  
    text = signal(data.cicd);
    parser = signal<smd.Parser | undefined>(undefined);
  
    error = input('');
    isSummarizing = input.required<boolean>();
    chunk = input.required<string>();
    chunks = input.required<string>();
  
    answer = viewChild.required<ElementRef<HTMLDivElement>>('answer');
    element = computed(() => this.answer().nativeElement);
  
    getSummary = output<string>();
  
    constructor() {
      afterRenderEffect({
        write: () => {  
          const parser = this.parser();
          if (!parser) {
            console.log('no parser, return');
            return;
          }
          const chunks = this.chunks();
  
          DOMPurify.sanitize(chunks);
          if (DOMPurify.removed.length) {
            // If the output was insecure, immediately stop what you were doing.
            // Reset the parser and flush the remaining Markdown.
            // smd.parser_end(parser);
            return;
          }
  
          if (this.isSummarizing()) {
            smd.parser_write(parser, this.chunk());
          } else {
            smd.parser_end(parser);
          }
        }
      });
    }
  
    requestSummary() {
      const element = this.element();
      const renderer = smd.default_renderer(element);
      this.parser.set(smd.parser(renderer));
  
      if (element.lastChild) {
        console.log('Remove children');
        this.renderer.setProperty(element, 'innerHTML', '');
      }
  
      this.getSummary.emit(this.text().trim());
    }
}

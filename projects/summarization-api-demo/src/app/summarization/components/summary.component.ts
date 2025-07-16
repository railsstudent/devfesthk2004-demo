import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, model, Renderer2, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import DOMPurify from 'dompurify';
import * as smd from 'streaming-markdown';
import { SummarizationService } from '../../ai/services/summarization.service';

@Component({
    selector: 'app-summary',
    imports: [FormsModule],
    template: `
    <label for="content">Content:</label>
    <textarea id="content" name="content" rows="10" [(ngModel)]="content"></textarea>
    <div>
      @let buttonText = isSummarizing() ? 'Summarizing...' : 'Summarize';
      @let disabled = content().trim() === '' || isSummarizing();
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
    summarizationService = inject(SummarizationService);
    renderer = inject(Renderer2);
  
    content = model.required<string>();  
    options = input.required<SummarizerCreateCoreOptions>();
  
    answer = viewChild.required<ElementRef<HTMLDivElement>>('answer');
    element = computed(() => this.answer().nativeElement);

    parser = signal<smd.Parser | undefined>(undefined);
    error = signal('');
    chunks = signal('');
    chunk = signal('');
    isSummarizing = signal(false);
  
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
  
    async requestSummary() {
        const element = this.element();
        const renderer = smd.default_renderer(element);
        this.parser.set(smd.parser(renderer));
    
        if (element.lastChild) {
            console.log('Remove children');
            this.renderer.setProperty(element, 'innerHTML', '');
        }
  
        this.isSummarizing.set(true);
        let summarizer: Summarizer | undefined = undefined;
        try {
            summarizer = await this.summarizationService.createSummarizer(this.options());
            if (summarizer) {
                const stream = summarizer.summarizeStreaming(this.content().trim(), {
                    signal: this.summarizationService.signal,
                });

                for await (const chunk of stream) {
                    this.chunks.update((prev) => prev + chunk);
                    this.chunk.set(chunk);
                }
            }
        } catch (err) {
            console.error(err);
            this.error.set('Error in streaming the summary.');
        } finally {
            if (summarizer) {
                summarizer.destroy();
            }
            this.isSummarizing.set(false);
        }
    }
}

import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, linkedSignal, model, Renderer2, signal, viewChild, WritableSignal } from '@angular/core';
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
    isSummarizing = signal(false);

    chunk = signal('');
    chunks = linkedSignal<string, string>({
      source: () => this.chunk(),
      computation: (chunk, previous) => {
        if (!previous || !previous?.value) {
          return chunk;
        }
        return `${previous.value}${chunk}`;
      }
    });

    streamReader = this.summarizationService.createChunkStreamReader();
  
    constructor() {
      afterRenderEffect({
        write: () => {  
          const parser = this.parser();
          if (!parser) {
            console.log('no parser, return');
            return;
          }
  
          DOMPurify.sanitize(this.chunks());
          if (DOMPurify.removed.length) {
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
        this.clearSummary();
    
        this.isSummarizing.set(true);
        let summarizer: Summarizer | undefined = undefined;
        try {
            summarizer = await this.summarizationService.createSummarizer(this.options());
            if (summarizer) {
              await this.streamReader(summarizer, this.content().trim(), this.chunk, this.isSummarizing);
            }
        } catch (err) {
            console.error(err);
            this.error.set('Error in streaming the summary.');
        }
    }

    private clearSummary(): void {
      const element = this.element();
      if (element.lastChild) {
        this.renderer.setProperty(element, 'innerHTML', '');
      }

      const markdown_renderer = smd.default_renderer(element);
      this.parser.set(smd.parser(markdown_renderer));
    }
}

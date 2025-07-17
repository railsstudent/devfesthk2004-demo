import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, linkedSignal, model, Renderer2, signal, untracked, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ParserService } from '../../ai/services/parser.service';
import { SummarizationService } from '../../ai/services/summarization.service';
import { Mode } from '../../ai/types/summarizer-mode.type';

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
    parserService = inject(ParserService);
    renderer = inject(Renderer2);
  
    content = model.required<string>();  
    options = input.required<SummarizerCreateCoreOptions>();
    selectedMode = input.required<Mode>()
  
    answer = viewChild.required<ElementRef<HTMLDivElement>>('answer');
    element = computed(() => this.answer().nativeElement);

    error = signal('');
    isSummarizing = signal(false);
    chunk = signal('');
    chunks = signal('');

    processSummary = this.summarizationService.createChunkStreamReader();
    isStreaming = computed(() => this.selectedMode() === 'streaming');
  
    constructor() {
      afterRenderEffect({
        write: () => {
          const chunks = untracked(this.chunks);
          this.parserService.writeToElement(chunks, this.chunk());
        }
      });
    }
  
    async requestSummary() {    
        let summarizer: Summarizer | undefined = undefined;
        try {
            this.isSummarizing.set(true);
            summarizer = await this.summarizationService.createSummarizer(this.options());
            if (summarizer) {
              this.chunks.set('');
              this.chunk.set('');
              const element = this.element();
              if (element.lastChild) {
                this.renderer.setProperty(element, 'innerHTML', '');
              }
              this.parserService.resetParser(element);
      
              const options = { 
                summarizer, 
                content: this.content().trim(), 
                chunks: this.chunks, 
                chunk: this.chunk, 
                isSummarizing: this.isSummarizing,
                isStreaming: this.isStreaming(),
              };
              await this.processSummary(options);
            }
        } catch (err) {
            console.error(err);
            this.error.set('Error in streaming the summary.');
        }
    }
}

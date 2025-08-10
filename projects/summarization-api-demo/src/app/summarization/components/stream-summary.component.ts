import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, model, Renderer2, resource, ResourceLoaderParams, ResourceStreamItem, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ParserService, SummarizationService } from '../../ai/services';

@Component({
    selector: 'app-stream-summary',
    imports: [FormsModule],
    template: `
      <label for="content">Content:</label>
      <textarea id="content" name="content" rows="20" [(ngModel)]="content"></textarea>
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
  export class StreamSummaryComponent {
    summarizationService = inject(SummarizationService);
    parserService = inject(ParserService);
    renderer = inject(Renderer2);
  
    content = model.required<string>();  
    options = input.required<SummarizerCreateCoreOptions>();
  
    answer = viewChild.required<ElementRef<HTMLDivElement>>('answer');
    element = computed(() => this.answer().nativeElement);

    error = signal('');
    isSummarizing = signal(false);
    chunk = signal<ResourceStreamItem<string | undefined>>({ value: '' });

    chunkResource = resource({
      stream: async () => this.chunk,
    });

    chunkValue = computed(() => this.chunkResource.hasValue() ? this.chunkResource.value() : undefined);
    
    processSummary = this.summarizationService.createChunkStreamReader();
   
    constructor() {
      afterRenderEffect({
        write: () => { 
          const value = this.chunkValue();
          if (value) {
            this.parserService.writeToElement(value);
          }
        }
      });
    }
  
    async requestSummary() {    
        try {
            const summarizer = await this.summarizationService.createSummarizer(this.options());
            if (summarizer) {
                this.clearSummary();
      
                await this.processSummary({ 
                  summarizer, 
                  content: this.content().trim(), 
                  chunk: this.chunk, 
                  isSummarizing: this.isSummarizing,
                });
            }
        } catch (err) {
            console.error(err);
            this.error.set('Error in streaming the summary.');
        }
    }

    private clearSummary() {
      const element = this.element();
      if (element.lastChild) {
        this.renderer.setProperty(element, 'innerHTML', '');
      }
      this.parserService.resetParser(element);
    }
}

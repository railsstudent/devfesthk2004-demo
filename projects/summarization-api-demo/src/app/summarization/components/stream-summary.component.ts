import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, model, Renderer2, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ParserService, SummarizationService } from '../../ai/services';

@Component({
    selector: 'app-stream-summary',
    imports: [FormsModule],
    templateUrl: './summary.component.html',
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
    context = input.required<string>();
  
    answer = viewChild.required<ElementRef<HTMLDivElement>>('answer');
    element = computed(() => this.answer().nativeElement);

    error = signal('');
    isSummarizing = signal(false);
    chunk = signal('');
    inputUsage = signal(0);
    inputQuota = signal(0);
    
    processSummary = this.summarizationService.createChunkReader();
   
    constructor() {
      afterRenderEffect({
        write: () => { 
          const value = this.chunk();
          if (value) {
            console.log('chunk', value)
            this.parserService.writeToElement(value);
          }
        }
      });
    }
  
    async requestSummary() {    
        try {
            this.isSummarizing.set(true);
            this.chunk.set('');
            this.clearSummary();

            const summarizer = await this.summarizationService.createSummarizer(this.options());
            if (summarizer) {
                const content = this.content().trim();
                const context = this.context().trim();
                this.inputUsage.set(await summarizer.measureInputUsage(content));
                this.inputQuota.set(summarizer.inputQuota);
                if (this.inputUsage() <= this.inputQuota()) {
                  await this.processSummary({ 
                    summarizer, 
                    content, 
                    chunk: this.chunk, 
                    isSummarizing: this.isSummarizing,
                    context,
                  });
                } else {
                  this.chunk.set('');
                  this.isSummarizing.set(false);
                }
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

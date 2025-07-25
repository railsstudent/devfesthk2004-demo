import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, model, Renderer2, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ParserService, SummarizationService } from '../../ai/services';
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

    processSummary = this.summarizationService.createChunkStreamReader();
  
    constructor() {
      afterRenderEffect({
        write: () => this.parserService.writeToElement(this.chunk())
      });
    }
  
    async requestSummary() {    
        try {
            this.isSummarizing.set(true);
            const summarizer = await this.summarizationService.createSummarizer(this.options());
            if (summarizer) {
                this.chunk.set('');
                const element = this.element();
                if (element.lastChild) {
                    this.renderer.setProperty(element, 'innerHTML', '');
                }
                this.parserService.resetParser(element);
      
                const options = { 
                    summarizer, 
                    content: this.content().trim(), 
                    chunk: this.chunk, 
                    isSummarizing: this.isSummarizing,
                    mode: this.selectedMode(),
                };
                await this.processSummary(options);
            }
        } catch (err) {
            console.error(err);
            this.error.set('Error in streaming the summary.');
        }
    }
}

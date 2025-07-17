import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, linkedSignal, model, Renderer2, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ParserService } from '../../ai/services/parser.service';
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
    parserService = inject(ParserService);
    renderer = inject(Renderer2);
  
    content = model.required<string>();  
    options = input.required<SummarizerCreateCoreOptions>();
  
    answer = viewChild.required<ElementRef<HTMLDivElement>>('answer');
    element = computed(() => this.answer().nativeElement);

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
          this.parserService.writeToElement(
            this.isSummarizing(), this.chunks(), this.chunk()
          );
        }
      });
    }
  
    async requestSummary() {
        const element = this.element();
        if (element.lastChild) {
          this.renderer.setProperty(element, 'innerHTML', '');
        }
        this.parserService.resetParser(this.element());
    
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
}

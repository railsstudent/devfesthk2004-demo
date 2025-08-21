import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, model, Renderer2, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ParserService, SummarizationService } from '../../ai/services';

@Component({
    selector: 'app-summary',
    imports: [FormsModule],
    templateUrl: './summary.component.html',
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
    context = input.required<string>();
  
    answer = viewChild.required<ElementRef<HTMLDivElement>>('answer');
    element = computed(() => this.answer().nativeElement);
  
    error = signal('');
    isSummarizing = signal(false);
    chunk = signal('');
    inputUsage = signal(0);
    inputQuota = signal(0);

    constructor() {
        afterRenderEffect({
          write: () => { 
            const value = this.chunk();
            if (value) {
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
                this.inputUsage.set(await summarizer.measureInputUsage(content));
                this.inputQuota.set(summarizer.inputQuota);
                const result = this.inputUsage() <= this.inputQuota() ? await this.summarizationService.summarize({ 
                    summarizer, 
                    content, 
                    context: this.context().trim(),
                }) : '';
                this.chunk.set(result);
            }
        } catch (err) {
            console.error(err);
            this.error.set('Error in streaming the summary.');
        } finally {
            this.isSummarizing.set(false);
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

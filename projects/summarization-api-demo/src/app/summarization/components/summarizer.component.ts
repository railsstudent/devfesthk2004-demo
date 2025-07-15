import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, linkedSignal, Renderer2, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import DOMPurify from 'dompurify';
import * as smd from 'streaming-markdown';
import { SummarizationService } from '../../ai/services/summarization.service';
import { SummarizerSelectOptions } from '../../ai/types/summarizer-select-options.type';
import data from '../data/description.json';
import { SummarizerOptionsComponent } from './summarizer-options.component';

@Component({
    selector: 'app-summarizer',
    imports: [FormsModule, SummarizerOptionsComponent],
    template: `
    <app-summarizer-options [selectOptions]="selectOptions()"
      [(selectedFormat)]="selectedFormat" [(selectedType)]="selectedType" [(selectedLength)]="selectedLength"
      [availability]="availability()"
    />
    @if (error()) {
      <p>Error: {{ error() }}</p>
      <hr />
    } 
    <label for="sharedContext">Shared Context:</label>
    <input id="sharedContext" name="sharedContext" [(ngModel)]="sharedContext" />
    <label for="content">Content:</label>
    <textarea id="content" name="content" rows="20" [(ngModel)]="text"></textarea>
    <div>
      @let buttonText = isSummarizing() ? 'Summarizing...' : 'Summarize';
      @let disabled = text().trim() === '' || isSummarizing();
      <button (click)="generateSummaries()" [disabled]="disabled">{{ buttonText }}</button>
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
export class SummarizerComponent {
  summarizationService = inject(SummarizationService);
  selectOptions = input.required<SummarizerSelectOptions>();

  formatOptions = computed(() => this.selectOptions().formats);
  typeOptions = computed(() => this.selectOptions().types);
  lengthOptions = computed(() => this.selectOptions().lengths);

  selectedFormat = linkedSignal({
    source: this.formatOptions,
    computation: (source) =>  source.find((item) => item === 'markdown') || source[0]
  });

  selectedType = linkedSignal({
    source: this.typeOptions,
    computation: (source) => source.find((item) => item === 'key-points') || source[0]
  });;
  
  selectedLength = linkedSignal({
    source: this.lengthOptions,
    computation: (source) => source.find((item) => item === 'medium') || source[0]
  });

  sharedContext = signal('Generate a summary of book description from https://www.packtpub.com/');
  text = signal(data.cicd);

  summarizerCreateOptions = computed<SummarizerCreateCoreOptions>(() => {
    return {
      format: this.selectedFormat(),
      type: this.selectedType(),
      length: this.selectedLength(),
      sharedContext: this.sharedContext(),
      expectedContextLanguages: ['en-US'],
      expectedInputLanguages: ['en-US'],
      outputLanguage: 'en-US',
    }
  });

  error = this.summarizationService.error;
  availability = this.summarizationService.availability;
  isSummarizing = computed(() => this.summarizationService.isSummarizing());
  chunk = this.summarizationService.chunk;
  chunks = this.summarizationService.chunks;
  
  answer = viewChild.required<ElementRef<HTMLDivElement>>('answer');
  element = computed(() => this.answer().nativeElement);

  parser = signal<smd.Parser | undefined>(undefined);
  
  renderer = inject(Renderer2);

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

  async generateSummaries() {
    const element = this.element();
    const renderer = smd.default_renderer(element);
    this.parser.set(smd.parser(renderer));

    if (element.lastChild) {
      console.log('Remove children');
      this.renderer.setProperty(element, 'innerHTML', '');
    }

    await this.summarizationService.summarizeStream(this.summarizerCreateOptions(), this.text().trim());
  }
}

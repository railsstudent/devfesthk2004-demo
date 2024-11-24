import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SummarizationService } from '../../ai/services/summarization.service';
import { SummarizerSelectOptions } from '../../ai/types/summarizer-select-options.type';
import { LineBreakPipe } from '../pipes/line-break.pipe';
import { SummarizerOptionsComponent } from './summarizer-oprions.component';

@Component({
    selector: 'app-summarizer',
    imports: [FormsModule, SummarizerOptionsComponent, LineBreakPipe],
    template: `
    <app-summarizer-options [selectOptions]="selectOptions()"
      [(selectedFormat)]="selectedFormat" [(selectedType)]="selectedType" [(selectedLength)]="selectedLength"
    />
    <label for="sharedContext">Shared Context:</label>
    <input id="sharedContext" name="sharedContext" [(ngModel)]="sharedContext" />
    <label for="content">Content:</label>
    <textarea id="content" name="content" rows="10" [(ngModel)]="text"></textarea>
    <label for="content">Content 2:</label>
    <textarea id="content2" name="content2" rows="10" [(ngModel)]="text2"></textarea>
    <div>
      @let buttonText = isSummarizing() ? 'Summarizing...' : 'Summarize';
      @let disabled = text().trim() === '' || text2().trim() === '' || isSummarizing();
      <button (click)="generateSummaries()" [disabled]="disabled">{{ buttonText }}</button>
    </div>
    @for (content of summaries(); track $index) {
      <p>Summary {{$index + 1}}</p>
      <div [innerHTML]="content | lineBreak"></div>
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

  formatOptions = computed(() => this.selectOptions().formatValues);
  typeOptions = computed(() => this.selectOptions().typeValues);
  lengthOptions = computed(() => this.selectOptions().lengthValues);

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

  sharedContext = signal('A blog post from langchain blog site, https://blog.langchain.dev/.');
  text = signal(`Procedural Memory
This term refers to long-term memory for how to perform tasks, similar to a brain’s core instruction set.
  
Procedural memory in humans: remembering how to ride a bike.
  
Procedural memory in Agents: the CoALA paper describes procedural memory as the combination of LLM weights and agent code, which fundamentally determine how the agent works.
  
In practice, we don’t see many (any?) agentic systems that update the weights of their LLM automatically or rewrite their code. We do, however, see some examples of an agent updating its own system prompt. While this is the closest practical example, it remains relatively uncommon.`);
  text2 = signal(`Semantic Memory
This is someone’s long-term store of knowledge.

Semantic memory in humans: it’s composed of pieces of information such as facts learned in school, what concepts mean and how they are related.

Semantic memory in agents: the CoALA paper describes semantic memory as a repository of facts about the world.

Today, this is most often used by agents to personalize an application.

Practically, we see this being done by using an LLM to extract information from the conversation or interactions the agent had. The exact shape of this information is usually application-specific. This information is then retrieved in future conversations and inserted into the system prompt to influence the agent’s responses.

Episodic Memory
This refers to recalling specific past events.

Episodic memory in humans: when a person recalls a particular event (or “episode”) experienced in the past.

Episodic memory in agents: the CoALA paper defines episodic memory as storing sequences of the agent’s past actions.

This is used primarily to get an agent to perform as intended.

In practice, episodic memory is implemented as few-shot example prompting. If you collect enough of these sequences, then this can be done via dynamic few-shot prompting. This is usually great for guiding the agent if there is a correct way to perform specific actions that have been done before. In contrast, semantic memory is more relevant if there isn’t necessarily a correct way to do things, or if the agent is constantly doing new things so the previous examples don’t help much.
`);
  isSummarizing = signal(false);

  summarizerCreateOptions = computed(() => {
    return {
      format: this.selectedFormat() as AISummarizerFormat,
      type: this.selectedType() as AISummarizerType,
      length: this.selectedLength() as AISummarizerLength,
      sharedContext: this.sharedContext(),
    }
  });

  summaries = this.summarizationService.summaries;

  async generateSummaries() {
    try {
      this.isSummarizing.set(true);
      const texts = [this.text().trim(), this.text2().trim()];
      await this.summarizationService.summarize(this.summarizerCreateOptions(), this.text().trim(), this.text2().trim());
    } finally {
      this.isSummarizing.set(false);
    }
  }
}

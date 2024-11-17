import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, Injector, OnDestroy, OnInit, output, Signal, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, filter, fromEvent, map, merge, of, switchMap } from 'rxjs';
import { PromptService } from '../../ai/services/prompt.service';
import { LineBreakPipe } from '../pipes/line-break.pipe';

@Component({
  selector: 'app-feedback-sentiment',
  standalone: true,
  imports: [FormsModule, LineBreakPipe],
  template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>Customer's Feedback</h3>
      @let myState = state();
      <div>
        <span class="label">Status: </span><span>{{ myState.status }}</span>
      </div>
      <div>
        <span class="label" for="input">Input: </span>
        <textarea id="input" name="input" rows="3"  
          [(ngModel)]="query" [disabled]="myState.disabled" #inputFeedback></textarea>
      </div>
      <div>
        <span class="label">Sentiment: </span>
        <span [innerHTML]="sentiment() | lineBreak"></span>
      </div>
      <div>
        <span class="label">Language: </span>
        <span [innerHTML]="sentiment() | lineBreak"></span>
      </div>
      @if (error()) {
        <div>
          <span class="label">Error: </span>
          <p>{{ error() }}</p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackSentimentComponent implements OnDestroy, OnInit {
  promptService = inject(PromptService);
  injector = inject(Injector);

  textArea = viewChild.required<ElementRef<HTMLTextAreaElement>>('inputFeedback');

  isLoading = signal(false);
  error = signal('');
  query = signal('La comida es buena y el servicio es excelente.');
  sentiment!: Signal<string>;

  state = computed(() => {
    const isLoading = this.isLoading();
    return {
        status: isLoading ? 'Processing...' : 'Idle',
        disabled: isLoading,
    }
  });

  inputEntered = output<{ sentiment: string; language: string }>();

  ngOnInit(): void {
    const inputFeedback$ = fromEvent(this.textArea().nativeElement, 'input')
      .pipe(
        debounceTime(1000),
        filter((evt) => !!evt.target),
        map((target) => 'value' in target ? target.value as string : ''),      
      );

    const sentiment$ = merge(inputFeedback$, of(this.query()))
      .pipe(
        switchMap((query) => {
          this.isLoading.set(true);
          this.error.set('');
          return this.promptService.prompt(query)
            .catch((e) => {
              const errMsg = e instanceof Error ? e.message : 'Error in finding the sentiment.';
              this.error.set(errMsg);
              return 'error';
            })  
            .finally(() => this.isLoading.set(false));
        }),
      );
    
      this.sentiment = toSignal(sentiment$, { injector: this.injector, initialValue: '' });
  }

  ngOnDestroy(): void {
    this.promptService.destroySession();
  }
}

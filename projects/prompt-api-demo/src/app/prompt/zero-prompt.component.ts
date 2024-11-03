import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PromptService } from '../ai/services/prompt.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, filter, finalize, from, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-zero-prompt',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h3>Zero-shot prompting</h3>
    <div>
      <span class="label">Status: </span><span>{{ status() }}</span>
    </div>
    <span class="label" for="input">Prompt: </span>
    <input id="input" name="input" [(ngModel)]="query" [disabled]="isLoading()" />
    <div>
      <span class="label">Response:</span>
      <p>{{ response() }}</p>
    </div>
  `,
  styles: `
    input {
      width: 100%;
    }

    button, input {
      margin-bottom: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZeroPromptComponent {
  promptService = inject(PromptService);
  
  query = signal('');
  isLoading = signal(false);
  
  #response$ = toObservable(this.query)
    .pipe(
      debounceTime(1000),
      filter((str) => str !== ''),
      tap(() => this.isLoading.set(true)),
      switchMap((str) => from(this.promptService.prompt(str))
        .pipe(
          catchError((e) => {
            const errMsg = e instanceof Error ? (e as Error).message : 'Error occurs in prompt service';
            console.error(errMsg);
            return of(errMsg);
          }),
          finalize(() => this.isLoading.set(false))
        )
      ),
    );
  
  response = toSignal(this.#response$, { initialValue: '' });

  status = computed(() => this.isLoading() ? 'Processing...' : 'Idle');
}

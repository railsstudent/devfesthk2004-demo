import { ChangeDetectionStrategy, Component, computed, inject, Injector, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ZeroPromptService } from '../ai/services/zero-prompt.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, filter, finalize, from, of, switchMap, tap } from 'rxjs';
import { TokenizationComponent } from './tokenization.component';

@Component({
  selector: 'app-zero-prompt',
  standalone: true,
  imports: [FormsModule, TokenizationComponent],
  template: `
    <h3>Zero-shot prompting</h3>
    <app-tokenization [numPromptTokens]="numPromptTokens()" [tokenContext]="tokenContext()" />
    <div>
      <span class="label">Status: </span><span>{{ status() }}</span>
    </div>
    <span class="label" for="input">Prompt: </span>
    <input id="input" name="input" [(ngModel)]="query" [disabled]="isLoading()" />
    <div>
      <span class="label">Response:</span>
      <!--
      <p>{{ response() }}</p>
-->
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
  promptService = inject(ZeroPromptService);
  
  query = signal('');
  isLoading = signal(false);
  error = signal('');

  injector = inject(Injector);
  session = this.promptService.getSession(this.injector);

  #numPromptTokens$ = toObservable(this.query)
    .pipe(
      debounceTime(1000),
      filter((str) => str !== ''),
      tap(() => { 
        this.isLoading.set(true);
        this.error.set('');
      }),
      switchMap((str) => from(this.promptService.countNumTokens(this.session(), str))
        .pipe(
          catchError((e) => {
            const errMsg = e instanceof Error ? (e as Error).message : 'Error occurs in prompt service';
            console.error(errMsg);
            this.error.set(errMsg);
            return of(0);
          }),
          finalize(() => this.isLoading.set(false))
        )
      ),
    );

  numPromptTokens = toSignal(this.#numPromptTokens$, { initialValue: 0 });
  tokenContext = computed(() => {
    const session = this.session();
    return {
      tokensSoFar: session.tokensSoFar as number,
      maxTokens: session.maxTokens as number,
      tokensLeft: session.tokensLeft as number,
    }
  });
  
  // #response$ = toObservable(this.query)
  //   .pipe(
  //     debounceTime(1000),
  //     filter((str) => str !== ''),
  //     tap(() => this.isLoading.set(true)),
  //     switchMap((str) => from(this.promptService.prompt(str))
  //       .pipe(
  //         catchError((e) => {
  //           const errMsg = e instanceof Error ? (e as Error).message : 'Error occurs in prompt service';
  //           console.error(errMsg);
  //           return of({ answer: errMsg, nunmTokens: 0 });
  //         }),
  //         finalize(() => this.isLoading.set(false))
  //       )
  //     ),
  //   );
  
  // response = toSignal(this.#response$, { initialValue: '' });

  status = computed(() => this.isLoading() ? 'Processing...' : 'Idle');
}

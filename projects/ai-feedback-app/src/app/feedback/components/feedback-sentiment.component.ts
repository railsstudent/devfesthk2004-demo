import { ChangeDetectionStrategy, Component, inject, Injector, OnDestroy, output, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, merge, of, switchMap } from 'rxjs';
import { LineBreakPipe } from '../pipes/line-break.pipe';
import { FeedbackSentimentService } from '../services/feedback-sentiment.service';
import { TranslationInput } from '../types/translation-input.type';
import { FeedbackLoadingComponent } from './feeback-loading.componen';
import { FeedbackErrorComponent } from './feedback-error.component';

@Component({
    selector: 'app-feedback-sentiment',
    imports: [FormsModule, LineBreakPipe, FeedbackErrorComponent, FeedbackLoadingComponent],
    template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>Customer's Feedback</h3>
      <app-feedback-loading [isLoading]="isLoading()">Processing</app-feedback-loading>
      <div>
        <span class="label" for="input">Input: </span>
        <textarea id="input" name="input" rows="5" [(ngModel)]="query" [disabled]="isLoading()"></textarea>
      </div>
      @let data = sentiment();
      @if (data) {
        <div style="display: flex;">
            <p style="flex-basis: 50%; flex-grow: 1; flex-shrink: 1;">
                <span class="label">Sentiment: </span>
                <span [innerHTML]="data.sentiment | lineBreak"></span>
            </p>
            <p style="flex-basis: 50%; flex-grow: 1; flex-shrink: 1;">
                <span class="label">Language: </span>
                <span [innerHTML]="data.language | lineBreak"></span>
            </p>
        </div>
      }
      <app-feedback-error [error]="error()" />
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackSentimentComponent implements OnDestroy {
  sentimentService = inject(FeedbackSentimentService);
  injector = inject(Injector);

  isLoading = signal(false);
  error = signal('');
  query = signal(`Tuve una experiencia muy mala en este restaurante. La comida llegó fría, lo cual fue decepcionante. Además, el camarero fue grosero durante toda la cena, lo que hizo que la situación fuera aún más incómoda.
Mientras servía nuestra bebida, derramó el líquido sobre mi abrigo y ni siquiera ofreció papel toalla para secarlo. Me pareció una falta total de atención al cliente.
Por si fuera poco, el baño estaba en condiciones horribles: olía mal y no había papel higiénico en la cabina.
En resumen, no recomendaría este lugar a nadie. La calidad del servicio y la limpieza son aspectos que definitivamente necesitan mejorar. No volveré.`);

  sentimentLanguageEvaluated = output<TranslationInput>();

  private sentiment$ = merge(toObservable(this.query).pipe(debounceTime(1000)), of(this.query()))
    .pipe(
      switchMap((query) => {
        this.isLoading.set(true);
        this.error.set('');
        return this.sentimentService.detectSentimentAndLanguage(query)
            .then((result) => {
                if (result) {
                  this.sentimentLanguageEvaluated.emit({
                    code: result.code,
                    sentiment: result.sentiment,
                    query
                  });
                }
                return result;
            }).catch((e: Error) => {
              this.error.set(e.message);
              return undefined;
            }).finally(() => this.isLoading.set(false));
      }));
  sentiment = toSignal(this.sentiment$, { injector: this.injector, initialValue: undefined });

  ngOnDestroy(): void {
    this.sentimentService.destroySessions();
  }
}

import { ChangeDetectionStrategy, Component, computed, effect, inject, Injector, output, signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, filter, finalize, switchMap } from 'rxjs';
import { FeedbackSentimentService } from '../services/feedback-sentiment.service';
import { TranslatedFeedbackWithPair } from '../types/sentiment-language.type';
import { FeedbackLoadingComponent } from './feeback-loading.componen';
import { FeedbackErrorComponent } from './feedback-error.component';

@Component({
    selector: 'app-feedback-sentiment',
    imports: [FormsModule, FeedbackErrorComponent, FeedbackLoadingComponent],
    template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>Customer's Feedback</h3>
      <app-feedback-loading [isLoading]="isLoading()">Processing</app-feedback-loading>
      <div>
        <span class="label" for="input">Input: </span>
        <textarea id="input" name="input" rows="5" [(ngModel)]="query" [disabled]="isLoading()"></textarea>
      </div>
      @let data = sentiment();
      @let language = sourceLanguage();
      <div style="display: flex;">
          <p style="flex-basis: 50%; flex-grow: 1; flex-shrink: 1;">
              <span class="label">Sentiment: </span>
              <span>{{ data }}</span>
          </p>
          <p style="flex-basis: 50%; flex-grow: 1; flex-shrink: 1;">
              <span class="label">Language: </span>
              <span>{{ language?.name || '' }}</span>
          </p>
      </div>
      <app-feedback-error [error]="error()" />
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackSentimentComponent {
  sentimentService = inject(FeedbackSentimentService);
  injector = inject(Injector);

  isLoading = signal(false);
  error = signal('');
  query = signal(`Tuve una experiencia muy mala en este restaurante. La comida llegó fría, lo cual fue decepcionante. Además, el camarero fue grosero durante toda la cena, lo que hizo que la situación fuera aún más incómoda.
Mientras servía nuestra bebida, derramó el líquido sobre mi abrigo y ni siquiera ofreció papel toalla para secarlo. Me pareció una falta total de atención al cliente.
Por si fuera poco, el baño estaba en condiciones horribles: olía mal y no había papel higiénico en la cabina.
En resumen, no recomendaría este lugar a nadie. La calidad del servicio y la limpieza son aspectos que definitivamente necesitan mejorar. No volveré.`);

  sentimentLanguageEvaluated = output<TranslatedFeedbackWithPair>();

  translation = this.sentimentService.translation;
  sourceLanguage = this.sentimentService.sourceLanguage;

  translatedText = computed(() => this.translation()?.text || '');

  #sentiment$ = toObservable(this.sentimentService.done)  
    .pipe(
      filter((done) => done && !!this.translatedText()),
        switchMap(() => {
          this.isLoading.set(true);
          this.error.set('');
          return this.sentimentService.detectSentiment(this.translatedText())
            .catch((err: Error) => { 
              this.error.set(err.message);
              return 'N/A';
            })
            .finally(() => this.isLoading.set(false));
        }),
    );
  
  sentiment = toSignal(this.#sentiment$, { initialValue: '' });

  debouncedQuery$ = toObservable(this.query).pipe(debounceTime(1000));

  constructor() {
    this.debouncedQuery$
      .pipe(
        switchMap((query) => {
          this.isLoading.set(true);
          this.error.set('');
          return this.sentimentService.translateFeedbackStream(query)
              .catch((e: Error) => this.error.set(e.message))
              .finally(() => this.isLoading.set(false));
        }),
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed()
      )
      .subscribe();

    effect(() => {
      const done = this.sentimentService.sentimentDone();

      const sentiment = untracked(this.sentiment);
      const sourceLanguage = untracked(this.sourceLanguage);
      const chunk = untracked(this.translation);

      if (done && sentiment && sourceLanguage && chunk) {
        this.sentimentLanguageEvaluated.emit({
          code: sourceLanguage.code,
          targetCode: chunk.targetCode,
          sentiment: sentiment,
          translatedText: chunk.text,
        });
      }
    });
  }
}

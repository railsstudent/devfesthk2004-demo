import { ChangeDetectionStrategy, Component, ElementRef, inject, Injector, OnDestroy, OnInit, output, Signal, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, filter, fromEvent, map, merge, of, switchMap } from 'rxjs';
import { LineBreakPipe } from '../pipes/line-break.pipe';
import { FeedbackSentimentService } from '../services/feedback-sentiment.service';
import { SentimentLanguage } from '../types/sentiment-language.type';
import { TranslationInput } from '../types/translation-input.type';
import { ErrorComponent } from './error.component';

@Component({
  selector: 'app-feedback-sentiment',
  standalone: true,
  imports: [FormsModule, LineBreakPipe, ErrorComponent],
  template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>Customer's Feedback</h3>
      @let isLoading = this.isLoading();
      @let status = isLoading ? 'Processing...' : 'Idle';
      <div>
        <span class="label">Status: </span><span>{{ status }}</span>
      </div>
      <div>
        <span class="label" for="input">Input: </span>
        <textarea id="input" name="input" rows="5"  
          [(ngModel)]="query" [disabled]="isLoading" #inputFeedback></textarea>
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
export class FeedbackSentimentComponent implements OnDestroy, OnInit {
  sentimentService = inject(FeedbackSentimentService);
  injector = inject(Injector);

  textArea = viewChild.required<ElementRef<HTMLTextAreaElement>>('inputFeedback');

  isLoading = signal(false);
  error = signal('');
  query = signal(`Tuve una experiencia muy mala en este restaurante. La comida llegó fría, lo cual fue decepcionante. Además, el camarero fue grosero durante toda la cena, lo que hizo que la situación fuera aún más incómoda.
Mientras servía nuestra bebida, derramó el líquido sobre mi abrigo y ni siquiera ofreció papel toalla para secarlo. Me pareció una falta total de atención al cliente.
Por si fuera poco, el baño estaba en condiciones horribles: olía mal y no había papel higiénico en la cabina.
En resumen, no recomendaría este lugar a nadie. La calidad del servicio y la limpieza son aspectos que definitivamente necesitan mejorar. No volveré.`);
  sentiment!: Signal<SentimentLanguage | undefined>;

  sentimentLanguageEvaluated = output<TranslationInput>();

  ngOnInit(): void {
    const inputFeedback$ = fromEvent(this.textArea().nativeElement, 'input')
        .pipe(
            debounceTime(1000),
            filter((evt) => !!evt.target),
            map((evt) => evt.target && 'value' in evt.target ? evt.target.value as string : ''),      
        );

    const sentiment$ = merge(inputFeedback$, of(this.query()))
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
    
        this.sentiment = toSignal(sentiment$, { injector: this.injector, initialValue: undefined });
    }

    ngOnDestroy(): void {
      this.sentimentService.destroySessions();
    }
}

import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, output, Renderer2, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatorService } from '../../ai/services/translator.service';
import { LanguagePair, LanguagePairAvailable } from '../../ai/types/language-pair.type';
import { ViewModel } from '../types/view-model.type';

@Component({
    selector: 'app-translate-text',
    imports: [FormsModule],
    template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem; display: flex;">
        <div style="margin-right: 0.5rem; flex-basis: 50%;">
            @for(pair of vm().languagePairs; track $index) {
                <p>canTranslate('{{ pair.sourceLanguage }}', '{{ pair.targetLanguage}}') = {{ pair.available }}</p>
            }
        </div>
        <div style="display: flex; flex-direction: column;">
            <div style="margin: 1rem;">
                @for(item of canTranslateButtons(); track $index) {
                    @let pair = { sourceLanguage: item.sourceLanguage, targetLanguage: item.targetLanguage };
                    @if (item.available === 'available') {
                        <button (click)="translateText(pair)" 
                            [disabled]="isDisableButtons()">{{ item.text }}</button>
                    } @else if (item.available === 'downloadable' || item.available === 'downloading') {
                        <button (click)="download(pair)"
                            [disabled]="isDisableButtons()">{{ item.text }}</button>
                    } 
                }
            </div>
            <div>
                <p>Usage: {{ vm().usage }} tokens</p>
                <p>{{ downloadingModelText() }}</p>
                <p>Translation: <span #answer></span></p>
            </div>
            @if (vm().strError) {
                <div>
                    <p>
                        <span class="label" for="input">Error:</span> 
                        <span>{{vm().strError}}</span>
                    </p>
                </div>
            }
        </div>
    </div>
  `,
    styles: `
        button {
            margin-right: 0.25rem;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslateTextComponent {
    service = inject(TranslatorService);
    vm = input.required<ViewModel>();
    
    isDisableButtons= computed(() => this.vm().downloadPercentage < 100);
    downloadingModelText = computed(() => {
        const percentage = this.vm().downloadPercentage;
        const isDownloading = percentage > 0 && percentage < 100;
        return isDownloading ? `Downloaded ${percentage}%` : '';
    });

    translation = signal('');
    downloadLanguagePack = output<LanguagePair>(); 

    canTranslateButtons = computed(() =>
        this.vm().languagePairs.reduce((acc, pair) => {
            if (pair.available === 'available') {
                return acc.concat({ ...pair, text: `${pair.sourceLanguage} to ${pair.targetLanguage}` })
            } else if (pair.available === 'downloadable' || pair.available === 'downloading') {
                return acc.concat({ ...pair, text: `Download ${pair.targetLanguage}` })
            }
            return acc;
        }, [] as (LanguagePairAvailable & { text: string })[])
    );

    answer = viewChild.required<ElementRef<HTMLSpanElement>>('answer');
    element = computed(() => this.answer().nativeElement);
    renderer = inject(Renderer2);
    chunk = this.service.chunk;

    constructor() {
        afterRenderEffect({
            write: () => { 
                console.log('this.chunk()', this.chunk());
                this.element().append(this.chunk());
            }
        })
    }

    async translateText(languagePair: LanguagePair) {
        if (this.element().lastChild) {
            this.renderer.setProperty(this.element(), 'innerHTML', '');
        }
        await this.service.translateStream(languagePair, this.vm().sample.inputText);
    }

    async download(languagePair: LanguagePair) {
        this.downloadLanguagePack.emit(languagePair);
    }
}

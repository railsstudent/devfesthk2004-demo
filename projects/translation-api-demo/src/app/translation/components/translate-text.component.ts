import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatorService } from '../../ai/services/translator.service';
import { LanguagePair, LanguagePairAvailable } from '../../ai/types/language-pair.type';

@Component({
    selector: 'app-translate-text',
    imports: [FormsModule],
    template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem; display: flex;">
        <div style="margin-right: 0.5rem; flex-basis: 50%;">
            @for(pair of languagePairs(); track $index) {
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
                <p>{{ downloadingText() }}</p>
                <p>Translation: {{ translation() }}</p>
            </div>
            @if (strError()) {
                <div>
                    <p>
                        <span class="label" for="input">Error:</span> 
                        <span>{{strError()}}</span>
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
    languagePairs = input.required<LanguagePairAvailable[]>();
    inputText = input.required<string>();
    isDisableButtons= computed(() => this.service.downloadPercentage() < 100);
    downloadingText = computed(() => {
        const percentage = this.service.downloadPercentage();
        const isDownloading = percentage > 0 && percentage < 100;
        return isDownloading ? `Downloaded ${percentage}%` : '';
    });

    translation = signal('');
    downloadSuccess = output<LanguagePairAvailable>();
    
    strError = this.service.strError;

    canTranslateButtons = computed(() =>
        this.languagePairs().reduce((acc, pair) => {
            if (pair.available === 'available') {
                return acc.concat({ ...pair, text: `${pair.sourceLanguage} to ${pair.targetLanguage}` })
            } else if (pair.available === 'downloadable' || pair.available === 'downloading') {
                return acc.concat({ ...pair, text: `Download ${pair.targetLanguage}` })
            }
            return acc;
        }, [] as (LanguagePairAvailable & { text: string })[])
    );

    async translateText(languagePair: LanguagePair) {
        this.translation.set('');
        const result = await this.service.translate(languagePair, this.inputText());
        this.translation.set(result);
    }

    async download(languagePair: LanguagePair) {
        const result = await this.service.downloadLanguagePackage(languagePair);
        if (result?.available === 'available') {
            this.downloadSuccess.emit(result);
        }
    }

}

import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CAPABILITIES_AVAILABLE } from '../../ai/enums/capabilities-available.enum';
import { TranslationService } from '../../ai/services/translation.service';
import { LanguagePair, LanguagePairAvailable } from '../../ai/types/language-pair.type';

@Component({
  selector: 'app-translate-text',
  standalone: true,
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
                    @if (item.available === 'readily') {
                        <button style="margin-right: 0.25rem;" (click)="translateText(pair)">{{ item.text }}</button>
                    } @else if (item.available === 'after-download') {
                        <button style="margin-right: 0.25rem;" (click)="download(pair)">{{ item.text }}</button>
                    } 
                }
            </div>
            <div>
                <p>Translation: {{ translation() }}</p>
            </div>
        </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslateTextComponent {
    service = inject(TranslationService);
    languagePairs = input.required<LanguagePairAvailable[]>();
    inputText = input.required<string>();
    translation = signal('');
    downloadSuccess = output<LanguagePairAvailable>();

    canTranslateButtons = computed(() =>
        this.languagePairs().reduce((acc, pair) => {
            if (pair.available === CAPABILITIES_AVAILABLE.READILY) {
                return acc.concat({ ...pair, text: `${pair.sourceLanguage} to ${pair.targetLanguage}` })
            } else if (pair.available === CAPABILITIES_AVAILABLE.AFTER_DOWNLOAD) {
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
        try {
         const result = await this.service.downloadLanguagePackage(languagePair);
         if (result?.available === CAPABILITIES_AVAILABLE.READILY) {
            this.downloadSuccess.emit(result);
         }
        } catch (e) {
            console.error(e);
        }
    }
}

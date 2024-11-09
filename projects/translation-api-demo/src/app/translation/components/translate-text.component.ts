import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageDetectionService } from '../../ai/services/language-detection.service';
import { LanguageDetectionWithNameResult } from '../../ai/types/language-detection-result.type';
import { LanguagePair, LanguagePairAvailable } from '../../ai/types/language-pair.type';
import { CAPABILITIES_AVAILABLE } from '../../ai/enums/capabilities-available.enum';
import { TranslationService } from '../../ai/services/translation.service';

@Component({
  selector: 'app-translate-text',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem; display: flex;">
        <div style="margin-right: 0.5rem;">
            @for(pair of languagePairs(); track $index) {
                <p>canTranslate('{{ pair.sourceLanguage }}', '{{ pair.targetLanguage}}') = {{ pair.available }}</p>
            }
        </div>
        <div>
            @for(item of canTranslateButtons(); track $index) {
                @let pair = { sourceLanguage: item.sourceLanguage, targetLanguage: item.targetLanguage };
                <button style="margin-right: 0.25rem;" (click)="translateText(pair)">{{ item.text }}</button>
            }
        </div>
        <div>
            <p>Translation: {{ translation() }}</p>
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

    canTranslateButtons = computed(() =>
        this.languagePairs().reduce((acc, { available, sourceLanguage, targetLanguage }) => { 
            return (available === CAPABILITIES_AVAILABLE.READILY) ?
                acc.concat({ sourceLanguage, targetLanguage, text: `${sourceLanguage} to ${targetLanguage}` }) : acc
        }, [] as  { sourceLanguage: string, targetLanguage: string, text: string }[])
    );

    async translateText(languagePair: LanguagePair) {
        this.translation.set('');
        const result = await this.service.translate(languagePair, this.inputText());
        this.translation.set(result);
    }
}

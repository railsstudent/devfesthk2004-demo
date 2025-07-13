import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
    selector: 'app-translate-draft',
    template: `
        @if (isNonEnglish() && draft()) {
            <div>
                <h3>Translate back to original language</h3>
                <p [innerHTML]="draft()"></p>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslateDraftComponent {
    code = input.required<string>();
    draft = input('');

    isNonEnglish = computed(() => this.code() !== 'en');
}

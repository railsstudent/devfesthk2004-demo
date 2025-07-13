import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
    selector: 'app-translate-draft',
    template: `
        @let text = draft();
        @if (isNonEnglish() && text) {
            <div>
                <h3>Translate back to original language</h3>
                <div>{{ text }}</div>
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

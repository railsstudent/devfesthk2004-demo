import { ChangeDetectionStrategy, Component, ElementRef, inject, Injector, input, OnDestroy, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResponseWriterService } from '../services/response-writer.service';

@Component({
  selector: 'app-response-writer',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div style="border: 1px solid black; border-radius: 0.25rem; padding: 1rem;">
      <h3>Write a response</h3>
      @let isLoading = this.isLoading();
      @if (isLoading) {
        <div>
            <span class="label">Status: </span><span>Generating...</span>
        </div>
      }
      <div style="margin-bottom: 0.5rem;">
        <textarea id="input" name="input" rows="3"  
          [(ngModel)]="draft" [disabled]="isLoading" #response></textarea>
        <button style="margin-right: 0.5rem;" (click)="generateDraft()"
            [disabled]="isLoading || feedback() === '' || sentiment() === ''">Generate a draft</button>
        <button [disabled]="isLoading || draft().trim() === ''">Fake submit</button>
      </div>
      @if (error()) {
        <div>
          <span class="label">Error: </span>
          <p>{{ error() }}</p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponseWriterComponent implements OnDestroy {
    feedback = input.required<string, string>({ transform: (x) => x.trim() });
    sentiment = input.required<string, string>({ transform: (x) => x.trim() });
    writerService = inject(ResponseWriterService);
    injector = inject(Injector);

    textArea = viewChild.required<ElementRef<HTMLTextAreaElement>>('response');

    isLoading = signal(false);
    error = signal('');
    draft = signal('');

    async generateDraft() {
        try {
            this.isLoading.set(true);
            const text = await this.writerService.generateDraft(this.feedback(), 
                this.sentiment());
            this.draft.set(text);
            // this.writerService.
        } finally {
            this.isLoading.set(false);
        }
    }

    ngOnDestroy(): void {
        this.writerService.destroySessions();
    }
}

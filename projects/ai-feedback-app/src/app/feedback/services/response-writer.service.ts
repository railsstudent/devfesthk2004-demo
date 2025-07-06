// import { inject, Injectable } from '@angular/core';
// import { WriterService } from '../../ai/services/writer.service';
// import { TranslationInput } from '../types/translation-input.type';
// import { FeedbackTranslationService } from './feedback-translation.service';

// export const ENGLISH_CODE = 'en';

// @Injectable({
//     providedIn: 'root'
// })
// export class ResponseWriterService {
//     #writerService = inject(WriterService);
//     #translationService = inject(FeedbackTranslationService);

//     async generateDraft({ query, sentiment, code } : TranslationInput): Promise<{ firstDraft: string, translation?: string }> {
//         try {
//             const firstDraft = await this.#writerService.generateDraft(query, sentiment);
//             if (code !== ENGLISH_CODE) {
//                 const translation = await this.#translationService.translate(firstDraft, {
//                     sourceLanguage: ENGLISH_CODE,
//                     targetLanguage: code
//                 });

//                 return {
//                     firstDraft,
//                     translation
//                 };
//             }

//             return { firstDraft };
//         } catch (e) {
//             const errMsg = e instanceof Error ? e.message : 'Error in generating a draft.';
//             throw new Error(errMsg);
//         }
//     }

//     async translateDraft(query: string, code: string): Promise<string> {
//         try {
//             if (code !== ENGLISH_CODE) {
//                 return this.#translationService.translate(query, {
//                     sourceLanguage: ENGLISH_CODE,
//                     targetLanguage: code
//                 });
//             }

//             return '';
//         } catch (e) {
//             const errMsg = e instanceof Error ? e.message : 'Error in finding the sentiment.';
//             throw new Error(errMsg);
//         }
//     }

//     destroySessions() {
//         this.#writerService.destroySession();
//     }
// }

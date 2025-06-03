import { Injectable, OnDestroy, signal } from '@angular/core';
import { EXPECTED_INPUT_LANGUAGES } from '../constants/input-languages.constant';
import { ERROR_CODES } from '../enums/error-codes.enum';
import { LanguageDetectionWithNameResult } from '../types/language-detection-result.type';
import { validateLanguageDetector } from '../utils/ai-detection';

@Injectable({
  providedIn: 'root'
})
export class LanguageDetectorService implements OnDestroy  {
    #controller = new AbortController();
    #detector = signal<LanguageDetector | undefined>(undefined);
    detector = this.#detector.asReadonly();
    strError = signal('');

    private readonly errors: Record<string, string> = {
        'InvalidStateError': 'The document is not active. Please try again later.',
        'NetworkError': 'The network is not available to download the AI model.',
        'NotAllowedError': 'The Language Detector is not allowed to create.',
        'NotSupportedError': 'The Language Detector does not support one of the expected input languages.',
        'OperationError': 'Operation error occurred when creating the Language Detector.',
        'UnknownError': 'Unknown error occurred while creating the Language Detector.',
    }

    async detect(query: string, minConfidence = 0.6): Promise<LanguageDetectionWithNameResult | undefined> {
        this.strError.set('');
        const detector = this.detector();
        if (!detector) {
            throw new Error(ERROR_CODES.NO_LANGUAGE_DETECTOR);
        }

        try {
            const results = await detector.detect(query);
            if (!results.length) {
                return undefined;
            }

            // choose the first language for which its confidence >= minConfidence
            const highConfidenceResult = results.find((result) => typeof result.confidence !== 'undefined' 
                && result.confidence >= minConfidence);
            
            const finalLanguage = highConfidenceResult ? highConfidenceResult : results[0];
            return ({ ...finalLanguage, name: this.languageTagToHumanReadable(finalLanguage.detectedLanguage)});
        } catch (e) {
            let err = '';
            if (e instanceof DOMException && e.name === 'InvalidStateError') {
                err = 'Document is not active. Please try again later.';
                console.error(err);
                this.strError.set(err);
            } else if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                err = 'LanguageDetector API quota exceeded. Please try again later.';
                console.error(err);
                this.strError.set(err);
            } else if (e instanceof Error) {
                console.error(`LanguageDetector API error: ${e.message}`);
                this.strError.set(e.message);
            }

            return undefined;
        }
    }

    async createDetector() {
        if (this.detector()) {
            console.log('Language Detector found.');
            return;
        }

        try {
            const availability = await validateLanguageDetector();
            const monitor = availability === 'available' ? undefined : 
                (m: CreateMonitor) => 
                    m.addEventListener('downloadprogress', (e) =>
                        console.log(`Language Detector: downloaded ${e.loaded * 100}%`)
                    );
                
            const newDetector = await LanguageDetector.create({
                expectedInputLanguages: EXPECTED_INPUT_LANGUAGES,
                signal: this.#controller.signal,
                monitor,
            });

            this.#detector.set(newDetector);
        } catch (e) {
            if (e instanceof DOMException) {
                const err = this.errors[e.name];
                if (err) {
                    console.error(err);
                    this.strError.set(err);
                }
            } else if (e instanceof Error) {
                console.error(e.message);
                this.strError.set(e.message);
            } else {
                console.error(e);
                this.strError.set(this.errors['UnknownError']);
            }
        }
    }

    private languageTagToHumanReadable(languageTag: string | undefined, targetLanguage = 'en') {
        const displayNames = new Intl.DisplayNames([targetLanguage], { type: 'language' });

        if (!languageTag) { 
            return 'N/A';
        }
        return displayNames.of(languageTag) || 'N/A';
    }

    ngOnDestroy(): void {
        const detector = this.detector();
        if (detector) {
            detector.destroy();
        }
    }
}

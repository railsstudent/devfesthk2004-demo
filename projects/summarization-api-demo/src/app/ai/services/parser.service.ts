import { Injectable, signal } from '@angular/core';
import DOMPurify from 'dompurify';
import * as smd from 'streaming-markdown';

@Injectable({
    providedIn: 'root'    
})
export class ParserService {
    parser = signal<smd.Parser | undefined>(undefined);

    resetParser(element: HTMLElement): void {  
        const markdown_renderer = smd.default_renderer(element);
        this.parser.set(smd.parser(markdown_renderer));
    }

    writeToElement(isBusy: boolean, chunks: string, chunk: string) {
        const parser = this.parser();
        if (!parser) {
            console.log('no parser, return');
            return;
        }

        DOMPurify.sanitize(chunks);
        if (DOMPurify.removed.length) {
            return;
        }

        if (isBusy) {
            smd.parser_write(parser, chunk);
        } else {
            smd.parser_end(parser);
        }
    }
}

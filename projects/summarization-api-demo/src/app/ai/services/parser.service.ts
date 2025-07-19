import { Injectable } from '@angular/core';
import DOMPurify from 'dompurify';
import * as smd from 'streaming-markdown';

@Injectable({
    providedIn: 'root'    
})
export class ParserService {
    parser: smd.Parser | undefined = undefined;

    resetParser(element: HTMLElement): void {  
        const markdown_renderer = smd.default_renderer(element);
        this.parser = smd.parser(markdown_renderer);
    }

    writeToElement(chunks: string, chunk: string) {
        if (!this.parser) {
            console.log('No parser, return');
            return;
        }

        if (!chunk) {
            console.log('Empty chunk, return');
            return;
        }

        DOMPurify.sanitize(chunks);
        if (DOMPurify.removed.length) {
            return;
        }

        smd.parser_write(this.parser, chunk);
    }
}

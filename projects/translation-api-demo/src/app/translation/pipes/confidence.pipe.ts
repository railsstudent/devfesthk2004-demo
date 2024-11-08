import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'confidence',
  standalone: true,
})
export class ConfidencePipe implements PipeTransform {

  transform(value: number, confidence: number): string {
    const level = value >= confidence ? 'High Confidence' : 'Low Confidnece';
    return `${value.toFixed(3)} (${level})`;
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageDetectorService } from '../../ai/services/language-detector.service';
import { LanguageDetectionWithNameResult } from '../../ai/types/language-detection-result.type';
import { AllowTranslation } from '../types/allow-translation.type';
import { LanguageDetectionResultComponent } from './language-detection-result.component';

@Component({
    selector: 'app-language-detection',
    imports: [FormsModule, LanguageDetectionResultComponent],
    template: `
    <div class="detection-container">
      <div>
        <span class="label" for="input">Input text: </span>
        <textarea id="input" name="input" [(ngModel)]="inputText" rows="3"></textarea>
      </div>
      <button style="margin-right: 0.5rem;" (click)="setup()">Create the Language Detector</button>
      <button (click)="detectLanguage()" [disabled]="isDisableDetectLanguage()">Detect the Language</button>
      <app-language-detection-result [detectedLanguage]="detectedLanguage()" [minConfidence]="minConfidence" />
      @if (strError()) {
        <div>
          <p>
            <span class="label" for="input">Error:</span> 
            {{strError()}}
          </p>
        </div>
      }
    </div>
  `,
  styles: `
    div.detection-container { 
      border: 1px solid black; 
      border-radius: 0.25rem; 
      padding: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageDetectionComponent {
  service = inject(LanguageDetectorService);
//   inputText = signal(`México es un país de vibrante cultura y gran diversidad, cuya capital, la Ciudad de México, es una de las metrópolis más pobladas del mundo. Con más de 125 millones de habitantes, su población es mayoritariamente mestiza y, aunque el español es el idioma oficial, se hablan numerosas lenguas indígenas como el náhuatl y el maya. Su gastronomía, reconocida mundialmente, deleita con platillos icónicos como los tacos, el mole y el pozole. El clima es increíblemente variado, desde desértico en el norte hasta tropical en el sur, lo que permite disfrutar de atracciones famosas que incluyen las antiguas ruinas de Chichén Itzá y Teotihuacán. Durante su visita, se puede nadar en los místicos cenotes de la península de Yucatán, bucear en los arrecifes de Cozumel, recorrer las coloridas ciudades coloniales como San Miguel de Allende, y relajarse en las paradisíacas playas de Cancún y Tulum, sin olvidar la vibrante vida nocturna y cultural de sus grandes urbes.
// Más allá de sus playas y su reconocida gastronomía, México posee una profunda riqueza cultural y una biodiversidad asombrosa. Su legado artístico es inmenso, visible en los murales de Diego Rivera y las obras introspectivas de Frida Kahlo. Las tradiciones ancestrales se viven con pasión, como en la celebración del Día de Muertos, una festividad llena de color y significado, mientras la música de mariachi resuena como el alma sonora del país. Geográficamente, el país es un mosaico de ecosistemas: desde las imponentes cadenas montañosas de la Sierra Madre y las selvas exuberantes de Chiapas, hasta los áridos desiertos de Sonora. Esta diversidad de paisajes alberga una fauna increíble, que incluye desde el sigiloso jaguar hasta las millones de mariposas monarca que hibernan en sus bosques, haciendo de cada rincón de México una experiencia única e inolvidable.`);
  inputText = signal(`Mexico is a country of vibrant culture and great diversity, whose capital, Mexico City, is one of the most populous metropolises in the world. With more than 125 million inhabitants, its population is mostly mestizo and, although Spanish is the official language, numerous indigenous languages such as Nahuatl and Maya are spoken. Its gastronomy, recognized worldwide, delights with iconic dishes such as tacos, mole and pozole. The climate is incredibly varied, from desert in the north to tropical in the south, allowing you to enjoy famous attractions including the ancient ruins of Chichen Itza and Teotihuacán. During your visit, you can swim in the mystical cenotes of the Yucatan Peninsula, dive in the reefs of Cozumel, tour the colorful colonial cities like San Miguel de Allende, and relax on the paradisiacal beaches of Cancun and Tulum, not forgetting the vibrant nightlife and cultural of its great cities.
Beyond its beaches and its renowned gastronomy, Mexico has a deep cultural richness and an amazing biodiversity. His artistic legacy is immense, visible in the murals of Diego Rivera and the introspective works of Frida Kahlo. Ancestral traditions are lived with passion, as in the celebration of the Day of the Dead, a festivity full of color and meaning, while the music of Mariachi resonates like the sound soul of the country. Geographically, the country is a mosaic of ecosystems: from the imposing mountain ranges of the Sierra Madre and the lush jungles of Chiapas, to the arid deserts of Sonora. This diversity of landscapes is home to an incredible fauna, which includes from the stealthy Jaguar to the millions of monarch butterflies that hibernate in its forests, making every corner of Mexico a unique and unforgettable experience.`);
  detectedLanguage = signal<LanguageDetectionWithNameResult | undefined>(undefined);

  detector = this.service.detector;
  strError = this.service.strError;
  isDisableDetectLanguage = computed(() => !this.detector() || this.inputText().trim() === '');
  nextStep = output<AllowTranslation>();

  minConfidence = 0.6;

  async setup() {
    await this.service.createDetector();
  }

  async detectLanguage() {
    const inputText = this.inputText().trim();
    const result = await this.service.detect(inputText, this.minConfidence);
    this.detectedLanguage.set(result);

    if (result?.detectedLanguage) {
      const toTranslate = typeof result.confidence !== 'undefined'
        && result.confidence >= this.minConfidence;
      this.nextStep.emit({
        code: result.detectedLanguage,
        toTranslate,
        inputText,
      });
    } else {
      this.nextStep.emit(undefined);
    }
  }
}

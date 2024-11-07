import { CAPABILITIES_AVAILABLE } from '../enums/capabilities-available.enum'

export type LanguageModelCapabilities = {
    available: CAPABILITIES_AVAILABLE,
    defaultTemperature: number;
    defaultTopK: number;
    maxTopK: number;
}

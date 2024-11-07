import { InjectionToken } from '@angular/core';

type LANGUAGE_DETECTOR_API_TYPE = { create: Function, capabilities: Function };
export const AI_LANGUAGE_DETECTION_API_TOKEN = new InjectionToken<LANGUAGE_DETECTOR_API_TYPE | undefined>('AI_LANGUAGE_DETECTION_API_TOKEN');

import { InjectionToken } from '@angular/core';

export const AI_PROMPT_API_TOKEN = new InjectionToken<{ create: Function, capabilities: Function } | undefined>('AI_PROMPT_API_TOKEN');

import { InjectionToken } from '@angular/core';

type PromptAPIDefinitions = { create: Function, capabilities: Function } | undefined;
export const AI_PROMPT_API_TOKEN = new InjectionToken<PromptAPIDefinitions>('AI_PROMPT_API_TOKEN');

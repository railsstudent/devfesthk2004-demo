import { debounceTime, distinctUntilChanged, filter, map, Observable, withLatestFrom } from 'rxjs';

export function finishDrafting(isGeneratingDraft$: Observable<boolean>, interval = 1000) {
    return function(source: Observable<string>) {
        return source.pipe(
            debounceTime(interval),
            map((draft) => draft.trim()),
            filter((draft) => !!draft),
            distinctUntilChanged(),
            withLatestFrom(isGeneratingDraft$),
            filter(([, isGenerating]) => !isGenerating),
            map(([draft]) => draft)
        );
    }
}

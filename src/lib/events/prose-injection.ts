export const PROSE_PARTIAL_INJECTION_EVENT = 'novellum:prose-partial-injection';

export interface ProsePartialInjectionRange {
	id: string;
	text: string;
	selected: boolean;
	order: number;
}

export interface ProsePartialInjectionDetail {
	projectId: string;
	sceneId: string;
	ranges: ProsePartialInjectionRange[];
}

export function dispatchProsePartialInjection(detail: ProsePartialInjectionDetail): void {
	if (typeof window === 'undefined') return;
	window.dispatchEvent(new CustomEvent<ProsePartialInjectionDetail>(PROSE_PARTIAL_INJECTION_EVENT, { detail }));
}

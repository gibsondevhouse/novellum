import { writable, derived } from 'svelte/store';

export const aiIsOpen = writable(false);
export const aiIsLoading = writable(false);
export const aiSuggestion = writable<string | null>(null);
export const aiError = writable<string | null>(null);
export const aiLastPrompt = writable<string>('');

export function toggleAiPanel() {
	aiIsOpen.update((v) => !v);
}

export async function requestSuggestion(prompt: string): Promise<void> {
	aiIsLoading.set(true);
	aiError.set(null);
	aiSuggestion.set(null);
	aiLastPrompt.set(prompt);

	try {
		const res = await fetch('/api/ai', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ prompt }),
		});
		if (!res.ok) throw new Error(`API error ${res.status}`);
		const data = await res.json();
		aiSuggestion.set(data.content ?? null);
	} catch (e) {
		aiError.set(e instanceof Error ? e.message : 'Unknown error');
	} finally {
		aiIsLoading.set(false);
	}
}

export function rejectSuggestion() {
	aiSuggestion.set(null);
	aiError.set(null);
}

export const isAiActive = derived([aiIsLoading, aiSuggestion, aiError], ([loading, sugg, err]) => {
	return loading || sugg !== null || err !== null;
});

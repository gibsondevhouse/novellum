import { updateScene } from './scene-repository.js';
import { createSnapshot } from './snapshot-repository.js';

interface AutosaveState {
	sceneId: string;
	projectId: string;
	onStatusChange?: (status: 'saving' | 'saved' | 'idle') => void;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pending: string | null = null;
let state: AutosaveState | null = null;

export function mount(
	sceneId: string,
	projectId: string,
	onStatusChange?: (s: 'saving' | 'saved' | 'idle') => void,
): void {
	state = { sceneId, projectId, onStatusChange };
	pending = null;
}

export function unmount(): void {
	if (debounceTimer) clearTimeout(debounceTimer);
	state = null;
	pending = null;
}

export function schedule(text: string): void {
	pending = text;
	if (debounceTimer) clearTimeout(debounceTimer);
	state?.onStatusChange?.('saving');
	debounceTimer = setTimeout(async () => {
		await flush();
	}, 2000);
}

export async function flushNow(): Promise<void> {
	if (debounceTimer) {
		clearTimeout(debounceTimer);
		debounceTimer = null;
	}
	await flush();
}

async function flush(): Promise<void> {
	if (!state || pending === null) return;
	const { sceneId, projectId, onStatusChange } = state;
	const text = pending;
	pending = null;
	const now = new Date().toISOString();
	try {
		await updateScene(sceneId, { content: text, updatedAt: now });
		if (text.trim().length > 0) {
			await createSnapshot(sceneId, projectId, text);
		}
		onStatusChange?.('saved');
	} catch {
		onStatusChange?.('idle');
		return;
	}
	setTimeout(() => onStatusChange?.('idle'), 2000);
}

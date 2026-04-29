/**
 * Recovery service — durable mirror of the autosave pending draft so
 * a crashed browser, OS reboot, or pulled-plug does not lose the
 * keystrokes between two server saves.
 *
 * Phase-001 made autosave retry-aware in memory. This phase makes the
 * pending draft survive *process death* by mirroring it to
 * localStorage on every keystroke. On scene mount the editor route
 * asks `scanPendingDrafts()` whether anything is waiting and renders
 * the recovery prompt if so.
 *
 * Storage shape (one entry per scene):
 *   key:   `novellum:pending-draft:{sceneId}`
 *   value: JSON { sceneId, projectId, text, savedAt }
 */

const KEY_PREFIX = 'novellum:pending-draft:';

export interface PendingDraft {
	sceneId: string;
	projectId: string;
	text: string;
	savedAt: string;
}

function getStorage(): Storage | null {
	// Prefer the DOM window's localStorage when available. Node 25
	// exposes a global `localStorage` stub that is unusable without
	// --localstorage-file; under jsdom that stub shadows the real
	// window storage, so we look at the window object first.
	if (typeof window !== 'undefined' && window.localStorage) {
		return window.localStorage;
	}
	if (typeof globalThis === 'undefined') return null;
	const g = globalThis as { localStorage?: Storage };
	return g.localStorage ?? null;
}

export function pendingDraftKey(sceneId: string): string {
	return `${KEY_PREFIX}${sceneId}`;
}

export function writePendingDraft(sceneId: string, projectId: string, text: string): void {
	const storage = getStorage();
	if (!storage) return;
	const draft: PendingDraft = {
		sceneId,
		projectId,
		text,
		savedAt: new Date().toISOString(),
	};
	try {
		storage.setItem(pendingDraftKey(sceneId), JSON.stringify(draft));
	} catch {
		// Quota exhaustion or privacy mode: not fatal, autosave will
		// still flush on the next debounce window.
	}
}

export function clearPendingDraft(sceneId: string): void {
	const storage = getStorage();
	if (!storage) return;
	try {
		storage.removeItem(pendingDraftKey(sceneId));
	} catch {
		// ignore
	}
}

export function readPendingDraft(sceneId: string): PendingDraft | null {
	const storage = getStorage();
	if (!storage) return null;
	const raw = storage.getItem(pendingDraftKey(sceneId));
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as PendingDraft;
		if (
			typeof parsed?.sceneId !== 'string' ||
			typeof parsed?.projectId !== 'string' ||
			typeof parsed?.text !== 'string' ||
			typeof parsed?.savedAt !== 'string'
		) {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

export function scanPendingDrafts(): PendingDraft[] {
	const storage = getStorage();
	if (!storage) return [];
	const drafts: PendingDraft[] = [];
	for (let i = 0; i < storage.length; i++) {
		const key = storage.key(i);
		if (!key || !key.startsWith(KEY_PREFIX)) continue;
		const sceneId = key.slice(KEY_PREFIX.length);
		const draft = readPendingDraft(sceneId);
		if (draft) drafts.push(draft);
	}
	return drafts;
}

/**
 * Returns the pending draft for the given scene if its text differs
 * from the current server text, otherwise null. Drafts that already
 * match the server are silently cleared so the recovery prompt only
 * surfaces real divergence.
 */
export function inspectDraft(sceneId: string, currentServerText: string): PendingDraft | null {
	const draft = readPendingDraft(sceneId);
	if (!draft) return null;
	if (draft.text === currentServerText) {
		clearPendingDraft(sceneId);
		return null;
	}
	return draft;
}

export function consumeDraft(sceneId: string): PendingDraft | null {
	const draft = readPendingDraft(sceneId);
	if (!draft) return null;
	clearPendingDraft(sceneId);
	return draft;
}

export function discardDraft(sceneId: string): void {
	clearPendingDraft(sceneId);
}

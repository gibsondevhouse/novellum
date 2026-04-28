import { getPreference, setPreference } from '$lib/preferences.js';

export type ReaderMode = 'classic' | 'book' | 'fullscreen';

const STORAGE_KEY = 'novellum:reader';
const PREF_KEY = 'app.readerMode';

interface PersistedReaderState {
	mode: ReaderMode;
	lastBookId: string | null;
	pageIndex: Record<string, number>;
}

function readStorage(): Partial<PersistedReaderState> {
	if (typeof localStorage === 'undefined') return {};
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
	} catch {
		return {};
	}
}

function writeStorage(): void {
	if (typeof localStorage === 'undefined') return;
	const state: PersistedReaderState = {
		mode: getReaderMode(),
		lastBookId: getLastReadBookId(),
		pageIndex: getPageIndexMap(),
	};
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// storage unavailable
	}
	void setPreference(PREF_KEY, state);
}

const saved = readStorage();

let mode: ReaderMode = $state(saved.mode ?? 'classic');
let lastBookId: string | null = $state(saved.lastBookId ?? null);
let pageIndexMap: Record<string, number> = $state(saved.pageIndex ?? {});

// Reconcile cached value with SQLite-canonical value on first browser run.
if (typeof window !== 'undefined') {
	void getPreference<PersistedReaderState | null>(PREF_KEY, null).then((remote) => {
		if (!remote) return;
		if (remote.mode && remote.mode !== mode) mode = remote.mode;
		if (remote.lastBookId !== undefined && remote.lastBookId !== lastBookId) {
			lastBookId = remote.lastBookId;
		}
		if (remote.pageIndex && Object.keys(remote.pageIndex).length > 0) {
			pageIndexMap = { ...pageIndexMap, ...remote.pageIndex };
		}
	});
}

export function getReaderMode(): ReaderMode {
	return mode;
}

export function setReaderMode(next: ReaderMode): void {
	mode = next;
	writeStorage();
}

export function getLastReadBookId(): string | null {
	return lastBookId;
}

export function setLastReadBookId(id: string): void {
	lastBookId = id;
	writeStorage();
}

export function getPageIndexMap(): Record<string, number> {
	return pageIndexMap;
}

export function getBookPageIndex(bookId: string): number {
	return pageIndexMap[bookId] ?? 0;
}

export function setBookPageIndex(bookId: string, index: number): void {
	pageIndexMap = { ...pageIndexMap, [bookId]: index };
	writeStorage();
}

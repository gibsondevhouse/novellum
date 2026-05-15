import {
	readReaderNavigationState,
	readReaderPreferenceState,
	writeReaderNavigationState,
} from '$lib/navigation-state.js';

export type ReaderMode = 'classic' | 'book' | 'fullscreen';

interface PersistedReaderState {
	mode: ReaderMode;
	lastBookId: string | null;
	pageIndex: Record<string, number>;
}

function writeStorage(): void {
	const state: PersistedReaderState = {
		mode: getReaderMode(),
		lastBookId: getLastReadBookId(),
		pageIndex: getPageIndexMap(),
	};
	void writeReaderNavigationState(state);
}

const saved = readReaderNavigationState();

let mode: ReaderMode = $state((saved.mode as ReaderMode | undefined) ?? 'classic');
let lastBookId: string | null = $state(saved.lastBookId ?? null);
let pageIndexMap: Record<string, number> = $state(saved.pageIndex ?? {});

// Reconcile cached value with SQLite-canonical value on first browser run.
if (typeof window !== 'undefined') {
	void readReaderPreferenceState().then((remote) => {
		if (!remote) return;
		if (remote.mode && remote.mode !== mode) mode = remote.mode as ReaderMode;
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

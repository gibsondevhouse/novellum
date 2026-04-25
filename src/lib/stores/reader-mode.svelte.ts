export type ReaderMode = 'classic' | 'book' | 'fullscreen';

const STORAGE_KEY = 'novellum:reader';

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
	try {
		const state: PersistedReaderState = {
			mode: getReaderMode(),
			lastBookId: getLastReadBookId(),
			pageIndex: getPageIndexMap(),
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// storage unavailable
	}
}

const saved = readStorage();

let mode: ReaderMode = $state(saved.mode ?? 'classic');
let lastBookId: string | null = $state(saved.lastBookId ?? null);
let pageIndexMap: Record<string, number> = $state(saved.pageIndex ?? {});

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

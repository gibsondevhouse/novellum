export type ReaderMode = 'classic' | 'book' | 'fullscreen';

let mode: ReaderMode = $state('classic');

export function getReaderMode(): ReaderMode {
	return mode;
}

export function setReaderMode(next: ReaderMode): void {
	mode = next;
}

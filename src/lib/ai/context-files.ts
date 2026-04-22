const TEXT_ATTACHMENT_EXTENSIONS = new Set([
	'.txt',
	'.md',
	'.markdown',
	'.json',
	'.csv',
]);

const TEXT_ATTACHMENT_MIME_TYPES = new Set([
	'application/json',
	'application/ld+json',
	'application/x-ndjson',
	'text/csv',
]);

export const NOVA_MAX_FILE_TEXT_CHARS = 60_000;

export interface ContextFileLike {
	name: string;
	mimeType: string;
}

export function getFileExtension(fileName: string): string {
	const lastDot = fileName.lastIndexOf('.');
	if (lastDot < 0) return '';
	return fileName.slice(lastDot).toLowerCase();
}

export function isSupportedTextAttachment(file: ContextFileLike): boolean {
	const mimeType = file.mimeType.trim().toLowerCase();
	if (mimeType.startsWith('text/')) return true;
	if (TEXT_ATTACHMENT_MIME_TYPES.has(mimeType)) return true;

	const extension = getFileExtension(file.name);
	return TEXT_ATTACHMENT_EXTENSIONS.has(extension);
}

export function isExplicitlyUnsupportedBinaryAttachment(file: ContextFileLike): boolean {
	const extension = getFileExtension(file.name);
	return extension === '.pdf' || extension === '.docx';
}

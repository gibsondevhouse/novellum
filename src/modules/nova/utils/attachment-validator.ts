import type { NovaAttachment } from '../types.js';

export const MAX_ATTACHMENT_SIZE_BYTES = 100 * 1024; // 100 KB
export const ALLOWED_EXTENSIONS = ['.md', '.txt'] as const;

export interface AttachmentValidationResult {
	valid: boolean;
	error?: string;
}

export function validateAttachmentFile(file: File): AttachmentValidationResult {
	const name = file.name;
	const dotIdx = name.lastIndexOf('.');
	const ext = dotIdx >= 0 ? name.slice(dotIdx).toLowerCase() : '';
	if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
		return {
			valid: false,
			error: `Only .md and .txt files are supported (got ${ext || 'no extension'}).`,
		};
	}
	if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
		return {
			valid: false,
			error: `File exceeds the 100 KB limit (${(file.size / 1024).toFixed(1)} KB).`,
		};
	}
	return { valid: true };
}

export function validateAttachment(attachment: NovaAttachment): AttachmentValidationResult {
	if (attachment.kind === 'file') {
		const dotIdx = attachment.filename.lastIndexOf('.');
		const ext = dotIdx >= 0 ? attachment.filename.slice(dotIdx).toLowerCase() : '';
		if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
			return {
				valid: false,
				error: `File "${attachment.filename}" has an unsupported extension.`,
			};
		}
		if (attachment.sizeBytes > MAX_ATTACHMENT_SIZE_BYTES) {
			return {
				valid: false,
				error: `File "${attachment.filename}" exceeds the 100 KB limit.`,
			};
		}
		if (!attachment.content.trim()) {
			return {
				valid: false,
				error: `File "${attachment.filename}" is empty.`,
			};
		}
	}
	return { valid: true };
}

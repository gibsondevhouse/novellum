/**
 * plan-031 stage-003 phase-006 — Attachment regression tests.
 *
 * Covers the attachment model lifecycle, client and server validation,
 * context injection, and disclosure count wiring.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { novaSession } from '$modules/nova';
import {
	validateAttachmentFile,
	validateAttachment,
	MAX_ATTACHMENT_SIZE_BYTES,
	ALLOWED_EXTENSIONS,
} from '$modules/nova';
import type { NovaAttachment } from '$modules/nova';

// ---------------------------------------------------------------------------
// Attachment validator — client-side (validateAttachmentFile)
// ---------------------------------------------------------------------------

describe('validateAttachmentFile', () => {
	function makeFile(name: string, size: number, type = 'text/plain'): File {
		const content = 'a'.repeat(size);
		return new File([content], name, { type });
	}

	it('accepts a valid .md file under the size limit', () => {
		const f = makeFile('notes.md', 1024);
		expect(validateAttachmentFile(f)).toEqual({ valid: true });
	});

	it('accepts a valid .txt file under the size limit', () => {
		const f = makeFile('notes.txt', 512);
		expect(validateAttachmentFile(f)).toEqual({ valid: true });
	});

	it('rejects a .pdf file', () => {
		const f = makeFile('doc.pdf', 512, 'application/pdf');
		const result = validateAttachmentFile(f);
		expect(result.valid).toBe(false);
		expect(result.error).toMatch(/\.md.*\.txt/i);
	});

	it('rejects a file with no extension', () => {
		const f = makeFile('Makefile', 512);
		const result = validateAttachmentFile(f);
		expect(result.valid).toBe(false);
		expect(result.error).toMatch(/no extension/i);
	});

	it('rejects a .js file', () => {
		const f = makeFile('evil.js', 100);
		expect(validateAttachmentFile(f).valid).toBe(false);
	});

	it('rejects a file that exceeds the 100 KB limit', () => {
		const f = makeFile('big.md', MAX_ATTACHMENT_SIZE_BYTES + 1);
		const result = validateAttachmentFile(f);
		expect(result.valid).toBe(false);
		expect(result.error).toMatch(/100 KB/i);
	});

	it('accepts a file exactly at the size limit', () => {
		const f = makeFile('exact.txt', MAX_ATTACHMENT_SIZE_BYTES);
		expect(validateAttachmentFile(f)).toEqual({ valid: true });
	});

	it('extension matching is case-insensitive', () => {
		const upper = makeFile('README.MD', 512);
		expect(validateAttachmentFile(upper)).toEqual({ valid: true });
	});

	it('ALLOWED_EXTENSIONS exports the expected set', () => {
		expect(ALLOWED_EXTENSIONS).toContain('.md');
		expect(ALLOWED_EXTENSIONS).toContain('.txt');
	});
});

// ---------------------------------------------------------------------------
// Attachment validator — server-side guard (validateAttachment)
// ---------------------------------------------------------------------------

describe('validateAttachment — server-side guard', () => {
	it('accepts a valid file attachment with content', () => {
		const a: NovaAttachment = {
			kind: 'file',
			id: crypto.randomUUID(),
			filename: 'outline.md',
			content: '# My Outline\n\nContent here.',
			sizeBytes: 200,
		};
		expect(validateAttachment(a)).toEqual({ valid: true });
	});

	it('rejects a file attachment with unsupported extension', () => {
		const a: NovaAttachment = {
			kind: 'file',
			id: crypto.randomUUID(),
			filename: 'data.json',
			content: '{}',
			sizeBytes: 2,
		};
		const result = validateAttachment(a);
		expect(result.valid).toBe(false);
		expect(result.error).toMatch(/unsupported extension/i);
	});

	it('rejects a file attachment that exceeds size limit', () => {
		const a: NovaAttachment = {
			kind: 'file',
			id: crypto.randomUUID(),
			filename: 'huge.md',
			content: 'x',
			sizeBytes: MAX_ATTACHMENT_SIZE_BYTES + 1,
		};
		const result = validateAttachment(a);
		expect(result.valid).toBe(false);
		expect(result.error).toMatch(/100 KB/i);
	});

	it('rejects a file attachment with empty content', () => {
		const a: NovaAttachment = {
			kind: 'file',
			id: crypto.randomUUID(),
			filename: 'blank.txt',
			content: '   ',
			sizeBytes: 3,
		};
		const result = validateAttachment(a);
		expect(result.valid).toBe(false);
		expect(result.error).toMatch(/empty/i);
	});

	it('accepts an entity attachment without content checks', () => {
		const a: NovaAttachment = {
			kind: 'entity',
			id: crypto.randomUUID(),
			entityKind: 'character',
			entityId: 'char-001',
			label: 'Elena',
			summary: 'Main protagonist.',
		};
		expect(validateAttachment(a)).toEqual({ valid: true });
	});
});

// ---------------------------------------------------------------------------
// novaSession — attachment lifecycle
// ---------------------------------------------------------------------------

describe('novaSession attachment lifecycle', () => {
	beforeEach(() => {
		novaSession.clear();
	});

	it('starts with empty attachments', () => {
		expect(novaSession.attachments).toHaveLength(0);
	});

	it('addAttachment adds an entity', () => {
		novaSession.addAttachment({
			kind: 'entity',
			id: 'att-1',
			entityKind: 'scene',
			entityId: 'scene-001',
			label: 'Opening scene',
		});
		expect(novaSession.attachments).toHaveLength(1);
		expect(novaSession.attachments[0].id).toBe('att-1');
	});

	it('addAttachment is idempotent for the same entityId', () => {
		const base = {
			kind: 'entity' as const,
			entityKind: 'character' as const,
			entityId: 'char-001',
			label: 'Elena',
		};
		novaSession.addAttachment({ ...base, id: 'att-1' });
		novaSession.addAttachment({ ...base, id: 'att-2' }); // same entityId, different attachment id
		expect(novaSession.attachments).toHaveLength(1);
	});

	it('addAttachment allows duplicate file attachments (different files)', () => {
		novaSession.addAttachment({
			kind: 'file',
			id: 'f-1',
			filename: 'a.md',
			content: 'foo',
			sizeBytes: 3,
		});
		novaSession.addAttachment({
			kind: 'file',
			id: 'f-2',
			filename: 'b.md',
			content: 'bar',
			sizeBytes: 3,
		});
		expect(novaSession.attachments).toHaveLength(2);
	});

	it('removeAttachment removes the correct item by id', () => {
		novaSession.addAttachment({
			kind: 'entity',
			id: 'att-a',
			entityKind: 'location',
			entityId: 'loc-001',
			label: 'The Castle',
		});
		novaSession.addAttachment({
			kind: 'entity',
			id: 'att-b',
			entityKind: 'character',
			entityId: 'char-002',
			label: 'Guard',
		});
		novaSession.removeAttachment('att-a');
		expect(novaSession.attachments).toHaveLength(1);
		expect(novaSession.attachments[0].id).toBe('att-b');
	});

	it('clearAttachments removes all attachments', () => {
		novaSession.addAttachment({
			kind: 'entity',
			id: 'att-1',
			entityKind: 'scene',
			entityId: 's-1',
			label: 'Scene 1',
		});
		novaSession.clearAttachments();
		expect(novaSession.attachments).toHaveLength(0);
	});

	it('clear() resets attachments alongside messages', () => {
		novaSession.addAttachment({
			kind: 'entity',
			id: 'att-1',
			entityKind: 'scene',
			entityId: 's-1',
			label: 'Scene 1',
		});
		novaSession.append({ role: 'user', content: 'hello' });
		novaSession.clear();
		expect(novaSession.attachments).toHaveLength(0);
		expect(novaSession.messages).toHaveLength(0);
	});
});

// ---------------------------------------------------------------------------
// ContextDisclosureState — attachedCount
// ---------------------------------------------------------------------------

describe('ContextDisclosureState attachedCount', () => {
	beforeEach(() => {
		novaSession.clear();
	});

	it('defaults attachedCount to 0 when not provided', () => {
		novaSession.setContextDisclosure(['project'], 2);
		expect(novaSession.contextDisclosure?.attachedCount).toBe(0);
	});

	it('records attachedCount when explicitly set', () => {
		novaSession.setContextDisclosure(['project', 'user-attached'], 3, { attachedCount: 2 });
		expect(novaSession.contextDisclosure?.attachedCount).toBe(2);
	});
});

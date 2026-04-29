import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	writePendingDraft,
	clearPendingDraft,
	readPendingDraft,
	scanPendingDrafts,
	inspectDraft,
	consumeDraft,
	discardDraft,
	pendingDraftKey,
} from '$modules/editor/services/recovery-service.js';

describe('recovery-service', () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	afterEach(() => {
		window.localStorage.clear();
		vi.restoreAllMocks();
	});

	describe('write/read/clear', () => {
		it('round-trips a pending draft via localStorage', () => {
			writePendingDraft('scene-1', 'project-1', '<p>hello</p>');
			const draft = readPendingDraft('scene-1');
			expect(draft).not.toBeNull();
			expect(draft?.sceneId).toBe('scene-1');
			expect(draft?.projectId).toBe('project-1');
			expect(draft?.text).toBe('<p>hello</p>');
			expect(draft?.savedAt).toBeTypeOf('string');
		});

		it('uses a deterministic key', () => {
			expect(pendingDraftKey('abc')).toBe('novellum:pending-draft:abc');
		});

		it('clearPendingDraft removes the entry', () => {
			writePendingDraft('scene-1', 'project-1', 'x');
			clearPendingDraft('scene-1');
			expect(readPendingDraft('scene-1')).toBeNull();
		});

		it('returns null for missing or malformed entries', () => {
			expect(readPendingDraft('nope')).toBeNull();
			window.localStorage.setItem(pendingDraftKey('bad'), 'not json');
			expect(readPendingDraft('bad')).toBeNull();
			window.localStorage.setItem(pendingDraftKey('partial'), JSON.stringify({ sceneId: 's' }));
			expect(readPendingDraft('partial')).toBeNull();
		});
	});

	describe('scanPendingDrafts', () => {
		it('collects every novellum draft and ignores foreign keys', () => {
			writePendingDraft('a', 'p1', 'A');
			writePendingDraft('b', 'p1', 'B');
			window.localStorage.setItem('unrelated', 'x');
			const drafts = scanPendingDrafts();
			expect(drafts.map((d) => d.sceneId).sort()).toEqual(['a', 'b']);
		});

		it('returns empty when localStorage is empty', () => {
			expect(scanPendingDrafts()).toEqual([]);
		});
	});

	describe('inspectDraft (pull-the-plug)', () => {
		it('returns the draft when text diverges from server', () => {
			writePendingDraft('scene-x', 'p1', '<p>recovered</p>');
			const draft = inspectDraft('scene-x', '<p>original</p>');
			expect(draft).not.toBeNull();
			expect(draft?.text).toBe('<p>recovered</p>');
			// not auto-consumed — caller decides
			expect(readPendingDraft('scene-x')).not.toBeNull();
		});

		it('clears and returns null when draft equals server text', () => {
			writePendingDraft('scene-x', 'p1', '<p>same</p>');
			const draft = inspectDraft('scene-x', '<p>same</p>');
			expect(draft).toBeNull();
			expect(readPendingDraft('scene-x')).toBeNull();
		});

		it('returns null when no draft exists', () => {
			expect(inspectDraft('absent', '')).toBeNull();
		});
	});

	describe('consumeDraft / discardDraft', () => {
		it('consumeDraft returns and removes the draft', () => {
			writePendingDraft('s', 'p', 'x');
			const draft = consumeDraft('s');
			expect(draft?.text).toBe('x');
			expect(readPendingDraft('s')).toBeNull();
		});

		it('discardDraft removes without returning', () => {
			writePendingDraft('s', 'p', 'x');
			discardDraft('s');
			expect(readPendingDraft('s')).toBeNull();
		});
	});

	describe('error tolerance', () => {
		it('write swallows quota errors', () => {
			const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
				throw new Error('quota');
			});
			expect(() => writePendingDraft('s', 'p', 'x')).not.toThrow();
			setItemSpy.mockRestore();
		});

		it('clear swallows storage errors', () => {
			const removeSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
				throw new Error('storage gone');
			});
			expect(() => clearPendingDraft('s')).not.toThrow();
			removeSpy.mockRestore();
		});
	});
});

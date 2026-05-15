import { describe, expect, it } from 'vitest';
import {
	resolveProjectSidebarActiveState,
	resolveReaderSidebarEntryState,
} from '../../src/lib/sidebar-navigation.js';

describe('sidebar-navigation helpers', () => {
	it('marks Editor active and AI Assistant inactive on editor route', () => {
		const state = resolveProjectSidebarActiveState(
			'/projects/proj-1',
			'/projects/proj-1/editor',
			new URLSearchParams(''),
		);
		expect(state.editor).toBe(true);
		expect(state.aiAssistant).toBe(false);
	});

	it('marks AI Assistant active and Editor inactive on editor?panel=ai route', () => {
		const state = resolveProjectSidebarActiveState(
			'/projects/proj-1',
			'/projects/proj-1/editor',
			new URLSearchParams('panel=ai'),
		);
		expect(state.aiAssistant).toBe(true);
		expect(state.editor).toBe(false);
	});

	it('returns locked Reader entry when there is no valid last-read id', () => {
		expect(resolveReaderSidebarEntryState({ id: null, status: 'empty' })).toEqual({
			href: undefined,
			locked: true,
		});
		expect(resolveReaderSidebarEntryState({ id: null, status: 'invalid' })).toEqual({
			href: undefined,
			locked: true,
		});
	});

	it('returns unlocked Reader entry when last-read id is valid', () => {
		expect(resolveReaderSidebarEntryState({ id: 'book-123', status: 'valid' })).toEqual({
			href: '/books/book-123',
			locked: false,
		});
	});
});

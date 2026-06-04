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

	it('marks Hub active on exact project base path', () => {
		const state = resolveProjectSidebarActiveState(
			'/projects/proj-1',
			'/projects/proj-1',
			new URLSearchParams(''),
		);
		expect(state.hub).toBe(true);
		expect(state.editor).toBe(false);
		expect(state.outline).toBe(false);
	});

	it('marks Outline active on outline route', () => {
		const state = resolveProjectSidebarActiveState(
			'/projects/proj-1',
			'/projects/proj-1/outline',
			new URLSearchParams(''),
		);
		expect(state.outline).toBe(true);
		expect(state.hub).toBe(false);
	});

	it('marks Worldbuilding active on world-building base and nested routes', () => {
		const base = resolveProjectSidebarActiveState(
			'/projects/proj-1',
			'/projects/proj-1/world-building',
			new URLSearchParams(''),
		);
		expect(base.worldbuilding).toBe(true);

		const nested = resolveProjectSidebarActiveState(
			'/projects/proj-1',
			'/projects/proj-1/world-building/characters',
			new URLSearchParams(''),
		);
		expect(nested.worldbuilding).toBe(true);
	});

	it('returns all-false state when on a non-project route (e.g. /books/[id])', () => {
		const state = resolveProjectSidebarActiveState(
			'/projects/proj-1',
			'/books/book-99',
			new URLSearchParams(''),
		);
		expect(state.hub).toBe(false);
		expect(state.editor).toBe(false);
		expect(state.outline).toBe(false);
		expect(state.worldbuilding).toBe(false);
		expect(state.aiAssistant).toBe(false);
	});

	it('returns all-false state on root route', () => {
		const state = resolveProjectSidebarActiveState(
			'/projects/proj-1',
			'/',
			new URLSearchParams(''),
		);
		expect(state.hub).toBe(false);
		expect(state.worldbuilding).toBe(false);
	});

	it('returns all-false state on settings route', () => {
		const state = resolveProjectSidebarActiveState(
			'/projects/proj-1',
			'/settings',
			new URLSearchParams(''),
		);
		expect(state.hub).toBe(false);
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

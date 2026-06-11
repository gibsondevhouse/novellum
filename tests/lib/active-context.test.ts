import { describe, expect, it } from 'vitest';
import { page } from '$app/state';
import { activeContext } from '../../src/lib/stores/active-context.svelte.js';

describe('activeContext store', () => {
	it('resolves projectId from route params on /projects routes', () => {
		page.url = new URL('http://localhost/projects/123/editor');
		page.params = { id: '123' };
		expect(activeContext.projectId).toBe('123');
	});

	it('returns null projectId on non-project routes', () => {
		page.url = new URL('http://localhost/settings');
		page.params = { id: '123' };
		expect(activeContext.projectId).toBe(null);
	});

	it('resolves sceneId from route params', () => {
		page.url = new URL('http://localhost/projects/123/editor/456');
		page.params = { id: '123', sceneId: '456' };
		expect(activeContext.sceneId).toBe('456');
	});

	it('resolves sceneId from query params (override)', () => {
		page.url = new URL('http://localhost/projects/123/editor/456?sceneId=789');
		page.params = { id: '123', sceneId: '456' };
		expect(activeContext.sceneId).toBe('789');
	});

	it('resolves chapterId from route params', () => {
		page.url = new URL('http://localhost/projects/1/arcs/2/acts/3/chapters/4');
		page.params = { id: '1', chapterId: '4' };
		expect(activeContext.chapterId).toBe('4');
	});

	it('resolves chapterId from query params (override)', () => {
		page.url = new URL('http://localhost/projects/1/editor?chapterId=5');
		page.params = { id: '1' };
		expect(activeContext.chapterId).toBe('5');
	});

	it('resolves sceneId from page data', () => {
		page.url = new URL('http://localhost/projects/1/editor');
		page.params = { id: '1' };
		page.data = { scene: { id: 'data-scene' } };
		expect(activeContext.sceneId).toBe('data-scene');
	});

	it('resolves chapterId from page data', () => {
		page.url = new URL('http://localhost/projects/1/editor');
		page.params = { id: '1' };
		page.data = { chapter: { id: 'data-chapter' } };
		expect(activeContext.chapterId).toBe('data-chapter');
	});
});

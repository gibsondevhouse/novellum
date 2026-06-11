import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import { page } from '$app/state';
import { NovaPanel, novaPanel, novaSession, aiSession } from '$modules/nova';

describe('NovaPanel.svelte — context-aware rendering', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
		novaPanel.close();
		novaSession.clear();
		aiSession.__resetForTests();
		// Reset page mock
		page.url = new URL('http://localhost/');
		page.params = {};
		page.data = {};
	});

	afterEach(() => {
		novaPanel.close();
		unmount(mount(NovaPanel, { target })); // ensure cleanup if not unmounted in test
		document.body.innerHTML = '';
	});

	it('renders AuthorDraftEngine on base editor route', () => {
		page.url = new URL('http://localhost/projects/123/editor');
		page.params = { id: '123' };
		
		const cmp = mount(NovaPanel, { 
			target, 
			props: { projectId: '123', activeChapterId: 'chap-1' } 
		});
		novaPanel.open();
		flushSync();

		expect(target.querySelector('.author-draft-engine')).not.toBeNull();
		unmount(cmp);
	});

	it('renders AuthorDraftEngine on deep editor routes', () => {
		page.url = new URL('http://localhost/projects/123/editor/scene-456');
		page.params = { id: '123', sceneId: 'scene-456' };
		
		const cmp = mount(NovaPanel, { 
			target, 
			props: { projectId: '123', activeChapterId: 'chap-1' } 
		});
		novaPanel.open();
		flushSync();

		expect(target.querySelector('.author-draft-engine')).not.toBeNull();
		unmount(cmp);
	});

	it('renders AuthorDraftEngine on chapter outline routes', () => {
		page.url = new URL('http://localhost/projects/123/arcs/1/acts/1/chapters/chap-1');
		page.params = { id: '123', chapterId: 'chap-1' };
		
		const cmp = mount(NovaPanel, { 
			target, 
			props: { projectId: '123', activeChapterId: 'chap-1' } 
		});
		novaPanel.open();
		flushSync();

		expect(target.querySelector('.author-draft-engine')).not.toBeNull();
		unmount(cmp);
	});

	it('does NOT render AuthorDraftEngine on world-building routes', () => {
		page.url = new URL('http://localhost/projects/123/world-building');
		page.params = { id: '123' };
		
		const cmp = mount(NovaPanel, { 
			target, 
			props: { projectId: '123' } 
		});
		novaPanel.open();
		flushSync();

		expect(target.querySelector('.author-draft-engine')).toBeNull();
		unmount(cmp);
	});
});

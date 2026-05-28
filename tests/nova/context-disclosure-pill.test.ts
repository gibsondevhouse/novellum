import { describe, it, expect, beforeEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import { ContextDisclosurePill, novaSession } from '$modules/nova';

describe('ContextDisclosurePill', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
		novaSession.clear();
	});

	it('shows a no-context state when no scopes are attached', () => {
		const cmp = mount(ContextDisclosurePill, { target });
		novaSession.setContextDisclosure(['no-context'], 0);
		flushSync();

		const pill = target.querySelector('.context-pill');
		expect(pill?.textContent).toContain('No context attached');
		unmount(cmp);
	});

	it('shows project baseline scopes and item counts', () => {
		const cmp = mount(ContextDisclosurePill, { target });
		novaSession.setContextDisclosure(['project', 'story-frame', 'scene'], 3);
		flushSync();

		const pill = target.querySelector('.context-pill');
		expect(pill?.textContent).toContain('Project attached');
		expect(pill?.textContent).toContain('Story frame');
		expect(pill?.textContent).toContain('Scene');
		expect(pill?.textContent).toContain('3 items');
		unmount(cmp);
	});

	it('surfaces compressed/truncated flags and warning text', () => {
		const cmp = mount(ContextDisclosurePill, { target });
		novaSession.setContextDisclosure(['project'], 1, {
			warnings: ['Context exceeded the standard budget and was compressed before sending.'],
			compressed: true,
			truncated: true,
		});
		flushSync();

		const pill = target.querySelector('.context-pill');
		expect(pill?.textContent).toContain('Compressed');
		expect(pill?.textContent).toContain('Trimmed');
		expect(pill?.getAttribute('title')).toContain('compressed');
		unmount(cmp);
	});
});

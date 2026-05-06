/**
 * plan-023 stage-005 phase-006 — NovaPanel error rendering.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import { NovaPanel, novaPanel, novaSession } from '$modules/nova';

describe('NovaPanel.svelte — error states', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
		window.sessionStorage.clear();
		novaPanel.close();
		novaSession.clear();
	});

	afterEach(() => {
		novaPanel.close();
		novaSession.clear();
		window.sessionStorage.clear();
	});

	it('renders an error bubble with the failure message', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		const stream = novaSession.beginStream('nova');
		novaSession.fail(stream.id, 'Network failure');
		flushSync();

		const bubble = target.querySelector('.nova-bubble-nova.is-error');
		expect(bubble).not.toBeNull();
		expect(bubble?.textContent).toContain('Network failure');
		unmount(cmp);
	});

	it('appends a Settings link for 401 / MissingCredentialsError messages', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		const stream = novaSession.beginStream('nova');
		novaSession.fail(stream.id, 'proxy stream failed: 401 Unauthorized');
		flushSync();

		const link = target.querySelector('.nova-error-hint a') as HTMLAnchorElement | null;
		expect(link).not.toBeNull();
		expect(link?.getAttribute('href')).toBe('/settings');
		expect(link?.textContent).toContain('Settings');
		unmount(cmp);
	});

	it('does not show the Settings link for generic errors', () => {
		const cmp = mount(NovaPanel, { target });
		novaPanel.open();
		const stream = novaSession.beginStream('nova');
		novaSession.fail(stream.id, 'Something else broke');
		flushSync();

		expect(target.querySelector('.nova-error-hint')).toBeNull();
		unmount(cmp);
	});
});

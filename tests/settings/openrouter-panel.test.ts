import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';

vi.mock('$lib/ai/credential-service.js', () => ({
	migrateLegacyLocalStorage: vi.fn(async () => {}),
	getStatus: vi.fn(async () => null),
	saveKey: vi.fn(),
	deleteKey: vi.fn(),
	testKey: vi.fn(),
}));

vi.mock('$lib/stores/toast.svelte.js', () => ({
	toast: vi.fn(),
}));

import OpenRouterPanel from '../../src/modules/settings/components/OpenRouterPanel.svelte';

describe('OpenRouterPanel.svelte', () => {
	let target: HTMLElement;
	let component: ReturnType<typeof mount> | null = null;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
	});

	afterEach(() => {
		if (component) {
			unmount(component);
			component = null;
		}
	});

	it('renders the OpenRouter docs link', () => {
		component = mount(OpenRouterPanel, { target, props: {} });
		flushSync();
		const link = target.querySelector('a[href="https://openrouter.ai/docs"]');
		expect(link).not.toBeNull();
		expect(link?.getAttribute('target')).toBe('_blank');
		expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
	});

	it('renders the API Keys Dashboard link', () => {
		component = mount(OpenRouterPanel, { target, props: {} });
		flushSync();
		const link = target.querySelector('a[href="https://openrouter.ai/settings/keys"]');
		expect(link).not.toBeNull();
		expect(link?.getAttribute('target')).toBe('_blank');
		expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
	});

	it('renders the ApiSettings heading through the wrapper', () => {
		component = mount(OpenRouterPanel, { target, props: {} });
		flushSync();
		const heading = target.querySelector('h2');
		expect(heading?.textContent).toContain('AI Integration');
	});
});

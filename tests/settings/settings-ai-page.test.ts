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

import AiPage from '../../src/routes/settings/ai/+page.svelte';

describe('settings/ai/+page.svelte', () => {
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

	it('mounts the ApiSettings component', () => {
		component = mount(AiPage, { target, props: {} });
		flushSync();
		const heading = target.querySelector('h2');
		expect(heading?.textContent).toContain('AI Integration');
	});

	it('renders the OpenRouter API key field', () => {
		component = mount(AiPage, { target, props: {} });
		flushSync();
		expect(target.textContent).toContain('OpenRouter API Key');
	});
});

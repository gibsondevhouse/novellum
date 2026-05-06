import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';

import ProviderComingSoon from '../../src/modules/settings/components/ProviderComingSoon.svelte';

describe('ProviderComingSoon.svelte', () => {
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

	it('renders the provider name', () => {
		component = mount(ProviderComingSoon, {
			target,
			props: { name: 'Ollama', description: 'Run models locally.' },
		});
		flushSync();
		expect(target.querySelector('h3')?.textContent).toContain('Ollama');
	});

	it('renders the description', () => {
		component = mount(ProviderComingSoon, {
			target,
			props: { name: 'Ollama', description: 'Run models locally.' },
		});
		flushSync();
		expect(target.textContent).toContain('Run models locally.');
	});

	it('renders the "Coming soon" badge', () => {
		component = mount(ProviderComingSoon, {
			target,
			props: { name: 'LM Studio', description: 'Use GGUF models.' },
		});
		flushSync();
		const badge = target.querySelector('.badge-soon');
		expect(badge?.textContent?.toLowerCase()).toContain('coming soon');
	});
});

import { describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';

import SettingsMarkdownDocument from '../../src/lib/components/settings/SettingsMarkdownDocument.svelte';

describe('SettingsMarkdownDocument.svelte', () => {
	it('renders markdown and hides legal-review template comments', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		const component = mount(SettingsMarkdownDocument, {
			target,
			props: {
				label: 'Policy',
				content: [
					'# Heading',
					'',
					'<!-- LEGAL_REVIEW_REQUIRED: remove before publishing -->',
					'',
					'- One',
					'- Two',
				].join('\n'),
			},
		});
		flushSync();

		const html = target.innerHTML;
		expect(html).toContain('<h1>Heading</h1>');
		expect(html).toContain('<li>One</li>');
		expect(html).toContain('<li>Two</li>');
		expect(html).not.toContain('LEGAL_REVIEW_REQUIRED');

		unmount(component);
		target.remove();
	});
});

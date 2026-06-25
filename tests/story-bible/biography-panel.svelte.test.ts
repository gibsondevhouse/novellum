import { mount, unmount } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import BiographyPanel from '$modules/story-bible/components/BiographyPanel.svelte';
import { createDossierLinkIndex } from '$modules/story-bible/services/dossier-link-resolver.js';

describe('BiographyPanel', () => {
	it('renders resolved anchors and calls navigation on click', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);
		const onNavigate = vi.fn();
		const index = createDossierLinkIndex({
			themes: [
				{
					id: 'theme-1',
					projectId: 'project-1',
					title: 'Truth',
					description: '',
					tensionPair: '',
					imagery: '',
					createdAt: '',
					updatedAt: '',
				},
			],
		});

		const component = mount(BiographyPanel, {
			target,
			props: {
				text: 'See @theme:theme-1 for the moral frame.',
				index,
				projectId: 'project-1',
				onNavigate,
			},
		});

		const link = target.querySelector<HTMLAnchorElement>('a');
		expect(link?.textContent).toBe('Truth');
		expect(link?.getAttribute('href')).toBe('/projects/project-1/story-bible#theme:theme-1');

		link?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		expect(onNavigate).toHaveBeenCalledWith({
			referenceKind: 'theme',
			kind: 'themes',
			id: 'theme-1',
			label: 'Truth',
		});

		unmount(component);
		target.remove();
	});
});

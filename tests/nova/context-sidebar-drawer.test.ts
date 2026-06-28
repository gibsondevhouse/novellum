import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import {
	ContextSidebarDrawer,
	contextControl,
	novaSession,
	type ContextControlEntity,
} from '$modules/nova';

const ENTITIES: ContextControlEntity[] = [
	{
		id: 'char-1',
		kind: 'character',
		label: 'Kira',
		summary: 'A courier with a secret map.',
	},
	{
		id: 'loc-1',
		kind: 'location',
		label: 'Glass Harbor',
		summary: 'A tidal city with mirrored docks.',
	},
];

describe('ContextSidebarDrawer', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
		contextControl.unbind();
		novaSession.clear();
	});

	it('renders implicit context rows and toggles pin/exclude state', () => {
		const cmp = mount(ContextSidebarDrawer, {
			target,
			props: {
				open: true,
				onClose: vi.fn(),
				initialEntities: ENTITIES,
			},
		});

		expect(target.textContent).toContain('2 implicit sources');
		expect(target.textContent).toContain('Kira');

		const pin = target.querySelector<HTMLButtonElement>(
			'[data-testid="context-pin-toggle"][data-entity-id="char-1"]',
		);
		const exclude = target.querySelector<HTMLButtonElement>(
			'[data-testid="context-exclude-toggle"][data-entity-id="loc-1"]',
		);
		expect(pin).not.toBeNull();
		expect(exclude).not.toBeNull();

		pin?.click();
		exclude?.click();
		flushSync();

		expect(pin?.getAttribute('aria-pressed')).toBe('true');
		expect(exclude?.getAttribute('aria-pressed')).toBe('true');
		expect(contextControl.pinnedEntityIds).toEqual(['char-1']);
		expect(contextControl.excludedEntityIds).toEqual(['loc-1']);
		expect(target.textContent).toContain('1 pinned');
		expect(target.textContent).toContain('1 excluded');

		unmount(cmp);
	});

	it('marks the token meter as dangerous when estimates exceed the limit', () => {
		const cmp = mount(ContextSidebarDrawer, {
			target,
			props: {
				open: true,
				onClose: vi.fn(),
				maxTokens: 10,
				initialEntities: [
					{
						id: 'lore-1',
						kind: 'loreEntry',
						label: 'Founding Myth',
						summary: 'x'.repeat(120),
					},
				],
			},
		});

		const meter = target.querySelector<HTMLElement>('[data-testid="context-token-meter"]');
		expect(meter?.dataset.severity).toBe('danger');
		expect(target.textContent).toContain('safe review threshold');

		unmount(cmp);
	});
});

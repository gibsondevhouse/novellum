import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import type { BrainstormProposal } from '$lib/ai/types.js';
import { brainstormStaging } from '$lib/stores/brainstorm-staging.store.svelte.js';
import PreGenerationDialog from '$modules/world-building/components/PreGenerationDialog.svelte';

const realmSeed: BrainstormProposal = {
	id: 'realm-seed-1',
	category: 'premise_variant',
	title: 'False Coast',
	description: 'A coastline that shifts whenever a ruler lies.',
	rationale: 'Turns the premise into an environmental pressure.',
	worldbuildSeedTarget: 'location_seed',
};

async function waitForSelector<T extends Element>(
	target: ParentNode,
	selector: string,
): Promise<T> {
	for (let i = 0; i < 10; i += 1) {
		await new Promise((resolve) => setTimeout(resolve, 0));
		flushSync();
		const el = target.querySelector<T>(selector);
		if (el) return el;
	}
	throw new Error(`Expected selector to render: ${selector}`);
}

describe('PreGenerationDialog brainstorm prefill', () => {
	beforeEach(() => {
		brainstormStaging.clear();
	});

	it('shows accepted brainstorm seeds and submits them as generation context', async () => {
		brainstormStaging.addSeed(realmSeed, {
			sessionSeedIdea: 'A lying court redraws maps.',
			acceptedAt: '2026-06-28T13:22:00.000Z',
		});

		const target = document.createElement('div');
		document.body.appendChild(target);
		const onsubmit = vi.fn();
		const oncancel = vi.fn();

		const cmp = mount(PreGenerationDialog, {
			target,
			props: {
				projectId: 'project-1',
				entityKind: 'realm',
				onsubmit,
				oncancel,
			},
		});

		await waitForSelector(target, '[data-testid="worldbuild-brainstorm-prefill"]');

		expect(target.querySelector('[data-testid="worldbuild-brainstorm-prefill"]')).not.toBeNull();
		expect(target.textContent).toContain('Accepted Brainstorm seeds');
		expect(target.textContent).toContain('False Coast');

		target.querySelector<HTMLButtonElement>('[data-testid="worldbuild-pregen-generate"]')?.click();
		flushSync();

		expect(onsubmit).toHaveBeenCalledTimes(1);
		const context = onsubmit.mock.calls[0]?.[0];
		expect(context).toMatchObject({
			note: expect.stringContaining('False Coast'),
			hints: [
				{
					name: 'False Coast',
					intent: 'target',
					source: 'brainstorm',
				},
			],
		});

		unmount(cmp);
		target.remove();
	});

	it('clears brainstorm prefill without touching unrelated manual targets', async () => {
		brainstormStaging.addSeed(realmSeed);

		const target = document.createElement('div');
		document.body.appendChild(target);
		const cmp = mount(PreGenerationDialog, {
			target,
			props: {
				projectId: 'project-1',
				entityKind: 'realm',
				onsubmit: vi.fn(),
				oncancel: vi.fn(),
			},
		});

		const input = await waitForSelector<HTMLInputElement>(target, '#pregen-name-input');
		input.value = 'Manual Realm';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();
		target.querySelector<HTMLButtonElement>('.pregen-manual-add')?.click();
		flushSync();

		target.querySelector<HTMLButtonElement>('[data-testid="worldbuild-brainstorm-clear"]')?.click();
		flushSync();

		expect(brainstormStaging.getSeedsForEntityKind('realm')).toHaveLength(0);
		expect(target.textContent).not.toContain('False Coast');
		expect(target.textContent).toContain('Manual Realm');

		unmount(cmp);
		target.remove();
	});
});

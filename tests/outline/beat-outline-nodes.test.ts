import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import type { Beat } from '$lib/db/domain-types';

const reorderBeatsMock = vi.fn();

vi.mock('$modules/editor/services/beat-repository.js', () => ({
	reorderBeats: (...args: unknown[]) => reorderBeatsMock(...args),
}));

import { BeatOutlineNodes } from '$modules/outline';

const NOW = '2026-06-28T14:50:00.000Z';

function beat(id: string, order: number, title: string): Beat {
	return {
		id,
		sceneId: 'scene-1',
		arcId: null,
		projectId: 'proj-1',
		title,
		type: 'action',
		order,
		notes: '',
		createdAt: NOW,
		updatedAt: NOW,
	};
}

describe('BeatOutlineNodes', () => {
	let target: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		target = document.createElement('div');
		document.body.appendChild(target);
		reorderBeatsMock.mockReset();
		reorderBeatsMock.mockResolvedValue(undefined);
	});

	it('renders collapsible ordered beat nodes and selects a beat', () => {
		const onSelectBeat = vi.fn();
		const cmp = mount(BeatOutlineNodes, {
			target,
			props: {
				sceneId: 'scene-1',
				beats: [beat('beat-b', 1, 'Second Beat'), beat('beat-a', 0, 'First Beat')],
				selectedBeatId: 'beat-a',
				onSelectBeat,
			},
		});

		const nodes = [...target.querySelectorAll<HTMLElement>('[data-testid="beat-outline-node"]')];
		expect(nodes.map((node) => node.dataset.beatId)).toEqual(['beat-a', 'beat-b']);

		nodes[1]?.querySelector('button')?.click();
		expect(onSelectBeat).toHaveBeenCalledWith('beat-b');

		target.querySelector<HTMLButtonElement>('.beat-outline__toggle')?.click();
		expect(target.querySelector('[data-testid="beat-outline-node"]')).toBeNull();

		unmount(cmp);
	});

	it('persists reordered beat ids after drag and drop', async () => {
		const cmp = mount(BeatOutlineNodes, {
			target,
			props: {
				sceneId: 'scene-1',
				beats: [beat('beat-a', 0, 'First Beat'), beat('beat-b', 1, 'Second Beat')],
				onSelectBeat: vi.fn(),
			},
		});
		const nodes = [...target.querySelectorAll<HTMLElement>('[data-testid="beat-outline-node"]')];

		nodes[1]?.dispatchEvent(new Event('dragstart', { bubbles: true }));
		nodes[0]?.dispatchEvent(new Event('dragover', { bubbles: true, cancelable: true }));
		nodes[0]?.dispatchEvent(new Event('drop', { bubbles: true }));
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(reorderBeatsMock).toHaveBeenCalledWith('scene-1', ['beat-b', 'beat-a']);
		const reorderedNodes = [
			...target.querySelectorAll<HTMLElement>('[data-testid="beat-outline-node"]'),
		];
		expect(reorderedNodes.map((node) => node.dataset.beatId)).toEqual(['beat-b', 'beat-a']);

		unmount(cmp);
	});
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadNovaContextOverridesMock = vi.fn();
const saveNovaContextOverridesMock = vi.fn();

vi.mock('$lib/project-metadata.js', () => ({
	loadNovaContextOverrides: (...args: unknown[]) => loadNovaContextOverridesMock(...args),
	saveNovaContextOverrides: (...args: unknown[]) => saveNovaContextOverridesMock(...args),
}));

import { ContextControlStore } from '$modules/nova/stores/context-control.svelte.js';

describe('ContextControlStore persistence', () => {
	beforeEach(() => {
		loadNovaContextOverridesMock.mockReset();
		saveNovaContextOverridesMock.mockReset();
		loadNovaContextOverridesMock.mockResolvedValue({
			pinnedEntityIds: [],
			excludedEntityIds: [],
		});
		saveNovaContextOverridesMock.mockResolvedValue(undefined);
	});

	it('loads scene-scoped context overrides from project metadata', async () => {
		loadNovaContextOverridesMock.mockResolvedValueOnce({
			pinnedEntityIds: ['char-1'],
			excludedEntityIds: ['loc-1'],
		});
		const store = new ContextControlStore();

		await store.loadForScene('proj-1', 'scene-1');

		expect(loadNovaContextOverridesMock).toHaveBeenCalledWith('proj-1', 'scene-1');
		expect(store.pinnedEntityIds).toEqual(['char-1']);
		expect(store.excludedEntityIds).toEqual(['loc-1']);
	});

	it('persists pin and exclusion changes to the active scene target', async () => {
		const store = new ContextControlStore();
		await store.loadForScene('proj-1', 'scene-1');

		store.togglePinned(' char-1 ');
		store.toggleExcluded('loc-1');

		expect(saveNovaContextOverridesMock).toHaveBeenLastCalledWith('proj-1', 'scene-1', {
			pinnedEntityIds: ['char-1'],
			excludedEntityIds: ['loc-1'],
		});
	});

	it('treats excluded IDs as higher priority than pinned IDs during hydrate', () => {
		const store = new ContextControlStore();

		store.hydrate({
			pinnedEntityIds: ['shared-id', 'char-1'],
			excludedEntityIds: ['shared-id'],
		});

		expect(store.pinnedEntityIds).toEqual(['char-1']);
		expect(store.excludedEntityIds).toEqual(['shared-id']);
	});

	it('clears scene overrides when the active scene target is missing', async () => {
		const store = new ContextControlStore();
		store.hydrate({ pinnedEntityIds: ['char-1'], excludedEntityIds: [] });

		await store.loadForScene('proj-1', null);

		expect(store.pinnedEntityIds).toEqual([]);
		expect(store.excludedEntityIds).toEqual([]);
		expect(loadNovaContextOverridesMock).not.toHaveBeenCalled();
	});
});

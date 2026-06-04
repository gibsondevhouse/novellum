import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockApiGet = vi.fn();
const mockApiPost = vi.fn();
const mockApiDel = vi.fn();

vi.mock('$lib/api-client.js', () => ({
	apiGet: (...args: unknown[]) => mockApiGet(...args),
	apiPost: (...args: unknown[]) => mockApiPost(...args),
	apiDel: (...args: unknown[]) => mockApiDel(...args),
}));

vi.mock('$modules/project/services/project-repository', () => ({
	getAllProjects: vi.fn().mockResolvedValue([]),
}));

const { createAssetsStore } = await import(
	'../../src/modules/assets/stores/assets.svelte.js'
);

const baseAsset = {
	projectId: 'proj-1',
	name: 'test-image.png',
	mimeType: 'image/png',
	data: 'data:image/png;base64,iVBORw0KGgoX...',
	sizeBytes: 1024,
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe('Assets Store', () => {
	it('can add and retrieve an asset', async () => {
		const returned = { id: 'asset-1', ...baseAsset, createdAt: 't', updatedAt: 't' };
		mockApiPost.mockResolvedValue(returned);
		mockApiGet.mockResolvedValueOnce(returned);

		const store = createAssetsStore(() => 'proj-1');
		const asset = await store.addAsset(baseAsset);

		expect(asset.id).toBeDefined();
		expect(asset.name).toBe('test-image.png');
		expect(store.assets.length).toBe(1);

		const fetched = await store.getAsset(asset.id);
		expect(fetched?.name).toBe('test-image.png');
	});

	it('can delete an asset', async () => {
		const returned = { id: 'asset-1', ...baseAsset, createdAt: 't', updatedAt: 't' };
		mockApiPost.mockResolvedValue(returned);
		mockApiDel.mockResolvedValue(undefined);

		const store = createAssetsStore(() => 'proj-1');
		const asset = await store.addAsset(baseAsset);

		expect(store.assets.length).toBe(1);

		await store.removeAsset(asset.id);

		expect(store.assets.length).toBe(0);
		expect(mockApiDel).toHaveBeenCalledWith(`/api/db/assets/${asset.id}`);
	});
});

import { describe, it, expect, beforeEach } from 'vitest';
import { db, resetDb } from '$lib/db';
import { createAssetsStore } from '$modules/assets/stores/assets.svelte';

describe('Assets Store', () => {
	beforeEach(async () => {
		await resetDb();
	});

	it('can add and retrieve an asset', async () => {
		const store = createAssetsStore(() => 'proj-1');
		
		const asset = await store.addAsset({
			projectId: 'proj-1',
			name: 'test-image.png',
			mimeType: 'image/png',
			data: 'data:image/png;base64,iVBORw0KGgoX...',
			sizeBytes: 1024
		});

		expect(asset.id).toBeDefined();
		expect(asset.name).toBe('test-image.png');
		expect(store.assets.length).toBe(1);
		
		const fetched = await store.getAsset(asset.id);
		expect(fetched?.name).toBe('test-image.png');
	});

	it('can delete an asset', async () => {
		const store = createAssetsStore(() => 'proj-1');
		
		const asset = await store.addAsset({
			projectId: 'proj-1',
			name: 'to-delete.png',
			mimeType: 'image/png',
			data: '...',
			sizeBytes: 500
		});

		expect(store.assets.length).toBe(1);
		
		await store.removeAsset(asset.id);
		
		expect(store.assets.length).toBe(0);
		
		const fetched = await db.assets.get(asset.id);
		expect(fetched).toBeUndefined();
	});
});

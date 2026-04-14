import { db, type Asset } from '$lib/db';

export function createAssetsStore(getProjectId: () => string | undefined) {
    let assets = $state<Asset[]>([]);
	let loading = $state(true);

    async function load() {
        loading = true;
        try {
			const pid = getProjectId();
            if (pid) {
                assets = await db.assets.where('projectId').equals(pid).sortBy('createdAt');
            } else {
                assets = await db.assets.orderBy('createdAt').reverse().toArray();
            }
        } catch (err) {
            console.error('Failed to load assets', err);
        } finally {
            loading = false;
        }
    }

	async function getAsset(id: string) {
		return db.assets.get(id);
	}

    async function addAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) {
        const id = crypto.randomUUID();
        // eslint-disable-next-line svelte/prefer-svelte-reactivity
        const now = new Date().toISOString();
        const newAsset: Asset = {
            ...asset,
            id,
            createdAt: now,
            updatedAt: now
        };
        await db.assets.add(newAsset);
        assets = [newAsset, ...assets];
        return newAsset;
    }

    async function removeAsset(id: string) {
        await db.assets.delete(id);
        assets = assets.filter(a => a.id !== id);
    }

    return {
        get assets() { return assets; },
		get loading() { return loading; },
        load,
        addAsset,
        removeAsset,
		getAsset
    };
}

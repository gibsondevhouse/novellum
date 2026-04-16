import { db, type Asset, type Project } from '$lib/db';

export interface Album {
	id: string;
	title: string;
	coverUrl?: string; // e.g. project cover image
	assets: Asset[];
}

export function createAssetsStore(getProjectId: () => string | undefined) {
    let assets = $state<Asset[]>([]);
	let projects = $state<Project[]>([]);
	let loading = $state(true);

	const albums = $derived.by(() => {
		const pid = getProjectId();
		if (pid) {
			const activeProject = projects.find(p => p.id === pid);
			return [{
				id: pid,
				title: activeProject?.title || 'Current Project',
				coverUrl: activeProject?.coverUrl,
				assets: assets
			}] as Album[];
		}

		// Global grouping
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const map = new Map<string, Album>();
		map.set('global', {
			id: 'global',
			title: 'Global Assets',
			assets: []
		});

		for (const p of projects) {
			map.set(p.id, {
				id: p.id,
				title: p.title,
				coverUrl: p.coverUrl,
				assets: []
			});
		}

		for (const a of assets) {
			const targetId = a.projectId && map.has(a.projectId) ? a.projectId : 'global';
			map.get(targetId)!.assets.push(a);
		}

		// Filter to albums that have assets or at least a coverUrl
		return Array.from(map.values()).filter(album => album.assets.length > 0 || album.coverUrl);
	});

    async function load() {
        loading = true;
        try {
			const pid = getProjectId();
			projects = await db.projects.toArray();
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
		get albums() { return albums; },
		get loading() { return loading; },
        load,
        addAsset,
        removeAsset,
		getAsset
    };
}

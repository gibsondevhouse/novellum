import type { Asset, Project } from '$lib/db/domain-types';
import { apiGet, apiPost, apiDel } from '$lib/api-client.js';
import { getAllProjects } from '$modules/project/services/project-repository';

export interface Album {
	id: string;
	title: string;
	coverUrl?: string;
	assets: Asset[];
}

export function createAssetsStore(getProjectId: () => string | undefined) {
	let assets = $state<Asset[]>([]);
	let projects = $state<Project[]>([]);
	let loading = $state(true);

	const albums = $derived.by(() => {
		const pid = getProjectId();
		if (pid) {
			const activeProject = projects.find((p) => p.id === pid);
			return [
				{
					id: pid,
					title: activeProject?.title || 'Current Project',
					coverUrl: activeProject?.coverUrl,
					assets: assets,
				},
			] as Album[];
		}

		// Global grouping
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const map = new Map<string, Album>();
		map.set('global', {
			id: 'global',
			title: 'Global Assets',
			assets: [],
		});

		for (const p of projects) {
			map.set(p.id, {
				id: p.id,
				title: p.title,
				coverUrl: p.coverUrl,
				assets: [],
			});
		}

		for (const a of assets) {
			const targetId = a.projectId && map.has(a.projectId) ? a.projectId : 'global';
			map.get(targetId)!.assets.push(a);
		}

		return Array.from(map.values()).filter((album) => album.assets.length > 0 || album.coverUrl);
	});

	async function load() {
		loading = true;
		try {
			const pid = getProjectId();
			projects = await getAllProjects();
			const params = pid ? { projectId: pid } : undefined;
			assets = await apiGet<Asset[]>('/api/db/assets', params);
		} catch (err) {
			console.error('Failed to load assets', err);
		} finally {
			loading = false;
		}
	}

	async function getAsset(id: string): Promise<Asset | undefined> {
		try {
			return await apiGet<Asset>(`/api/db/assets/${encodeURIComponent(id)}`);
		} catch {
			return undefined;
		}
	}

	async function addAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> {
		const newAsset = await apiPost<Asset>('/api/db/assets', asset);
		assets = [newAsset, ...assets];
		return newAsset;
	}

	async function removeAsset(id: string) {
		await apiDel(`/api/db/assets/${encodeURIComponent(id)}`);
		assets = assets.filter((a) => a.id !== id);
	}

	return {
		get assets() {
			return assets;
		},
		get albums() {
			return albums;
		},
		get loading() {
			return loading;
		},
		load,
		addAsset,
		removeAsset,
		getAsset,
	};
}

import { page } from '$app/state';
import { deriveRouteContext } from '$lib/navigation-state.js';

class ActiveProjectStore {
	get id(): string | null {
		return deriveRouteContext({
			pathname: page.url.pathname,
			searchParams: page.url.searchParams,
			params: page.params,
			data: page.data,
		}).projectId;
	}
}

export const activeProject = new ActiveProjectStore();

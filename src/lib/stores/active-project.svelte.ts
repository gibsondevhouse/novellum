import { page } from '$app/state';

class ActiveProjectStore {
	get id(): string | null {
		return page.url.pathname.startsWith('/projects/') ? (page.params.id ?? null) : null;
	}
}

export const activeProject = new ActiveProjectStore();

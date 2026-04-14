import { page } from '$app/state';

class ActiveProjectStore {
	get id(): string | null {
		return page.params.id ?? null;
	}
}

export const activeProject = new ActiveProjectStore();

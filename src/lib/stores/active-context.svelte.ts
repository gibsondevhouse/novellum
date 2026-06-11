import { page } from '$app/state';

/**
 * plan-044 — Centralized active context resolution.
 *
 * Derived reactively from SvelteKit's `$app/state`. Prioritizes
 * query parameters (for deep-linking and overrides) over route
 * parameters.
 */
class ActiveContextStore {
	/**
	 * Canonical Project ID.
	 * Derived from /projects/[id] route parameter.
	 */
	get projectId(): string | null {
		return page.url.pathname.startsWith('/projects/') ? (page.params.id ?? null) : null;
	}

	/**
	 * Canonical Scene ID.
	 * Derived from ?sceneId query param (override), [sceneId] route parameter,
	 * or page data.
	 */
	get sceneId(): string | null {
		return (
			page.url.searchParams.get('sceneId') ??
			page.params.sceneId ??
			(page.data.scene?.id as string | undefined) ??
			null
		);
	}

	/**
	 * Canonical Chapter ID.
	 * Derived from ?chapterId query param (override), [chapterId] route parameter,
	 * or page data.
	 */
	get chapterId(): string | null {
		return (
			page.url.searchParams.get('chapterId') ??
			page.params.chapterId ??
			(page.data.chapter?.id as string | undefined) ??
			null
		);
	}
}

export const activeContext = new ActiveContextStore();

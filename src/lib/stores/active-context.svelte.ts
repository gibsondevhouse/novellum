import { page } from '$app/state';
import { deriveRouteContext } from '$lib/navigation-state.js';

/**
 * plan-044 — Centralized active context resolution.
 *
 * Derived reactively from SvelteKit's `$app/state`. Prioritizes
 * query parameters (for deep-linking and overrides) over route
 * parameters.
 */
class ActiveContextStore {
	private get routeContext() {
		return deriveRouteContext({
			pathname: page.url.pathname,
			searchParams: page.url.searchParams,
			params: page.params,
			data: page.data,
		});
	}

	/**
	 * Canonical Project ID.
	 * Derived from /projects/[id] route parameter.
	 */
	get projectId(): string | null {
		return this.routeContext.projectId;
	}

	/**
	 * Canonical Scene ID.
	 * Derived from ?sceneId query param (override), [sceneId] route parameter,
	 * or page data.
	 */
	get sceneId(): string | null {
		return this.routeContext.activeSceneId;
	}

	/**
	 * Canonical Chapter ID.
	 * Derived from ?chapterId query param (override), [chapterId] route parameter,
	 * or page data.
	 */
	get chapterId(): string | null {
		return this.routeContext.activeChapterId;
	}
}

export const activeContext = new ActiveContextStore();

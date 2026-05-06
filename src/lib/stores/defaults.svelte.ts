/**
 * Defaults store — Default Home Page, Default Reader View, Default Project Type.
 *
 * Singleton, module-load instantiation, lazy hydrate via `defaults.hydrate()`.
 * Mirrors the pattern of `appearance.svelte.ts` and `reader-mode.svelte.ts`.
 *
 * Lives in `$lib/stores` (not `$modules/settings/stores`) so plan-023 stage-007
 * (reader entry point) and the project-hub creation flow can consume it across
 * module boundaries.
 *
 * SSR-safe: `hydrate()` is idempotent and uses the SSR-safe client preferences
 * helper (which short-circuits to defaults on the server).
 */
import { getPreference, setPreference } from '$lib/preferences.js';
import type { ReaderMode } from '$lib/stores/reader-mode.svelte.js';

export type HomePage = 'library' | 'last-read' | 'last-project';
export type ProjectType = 'novel' | 'story' | 'collection';
export type DefaultReaderView = ReaderMode;

export const HOME_PAGE_KEY = 'app.defaults.homePage';
export const READER_VIEW_KEY = 'app.defaults.readerView';
export const PROJECT_TYPE_KEY = 'app.defaults.projectType';

export const DEFAULT_HOME_PAGE: HomePage = 'library';
export const DEFAULT_READER_VIEW: DefaultReaderView = 'classic';
export const DEFAULT_PROJECT_TYPE: ProjectType = 'novel';

class DefaultsStore {
	homePage = $state<HomePage>(DEFAULT_HOME_PAGE);
	readerView = $state<DefaultReaderView>(DEFAULT_READER_VIEW);
	projectType = $state<ProjectType>(DEFAULT_PROJECT_TYPE);
	hydrated = $state(false);
	private hydrating: Promise<void> | null = null;

	async hydrate(): Promise<void> {
		if (this.hydrated) return;
		if (this.hydrating) return this.hydrating;
		this.hydrating = (async () => {
			const [hp, rv, pt] = await Promise.all([
				getPreference<HomePage>(HOME_PAGE_KEY, DEFAULT_HOME_PAGE),
				getPreference<DefaultReaderView>(READER_VIEW_KEY, DEFAULT_READER_VIEW),
				getPreference<ProjectType>(PROJECT_TYPE_KEY, DEFAULT_PROJECT_TYPE),
			]);
			this.homePage = hp;
			this.readerView = rv;
			this.projectType = pt;
			this.hydrated = true;
		})();
		try {
			await this.hydrating;
		} finally {
			this.hydrating = null;
		}
	}

	getDefaultHomePage(): HomePage {
		return this.homePage;
	}

	async setDefaultHomePage(value: HomePage): Promise<void> {
		this.homePage = value;
		await setPreference(HOME_PAGE_KEY, value);
	}

	getDefaultReaderView(): DefaultReaderView {
		return this.readerView;
	}

	async setDefaultReaderView(value: DefaultReaderView): Promise<void> {
		this.readerView = value;
		await setPreference(READER_VIEW_KEY, value);
	}

	getDefaultProjectType(): ProjectType {
		return this.projectType;
	}

	async setDefaultProjectType(value: ProjectType): Promise<void> {
		this.projectType = value;
		await setPreference(PROJECT_TYPE_KEY, value);
	}
}

export const defaults = new DefaultsStore();

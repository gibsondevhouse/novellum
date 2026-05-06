/**
 * Export defaults store — default profile and format selection.
 *
 * Singleton, module-load instantiation, lazy hydrate via `exportDefaults.hydrate()`.
 * Mirrors the pattern of `appearance.svelte.ts`.
 *
 * ManuscriptProfileId is redefined locally (not imported from $modules/export)
 * to keep this lib-scoped store within the allowed module boundaries.
 */
import { getPreference, setPreference } from '$lib/preferences.js';

// Mirror of ManuscriptProfileId from $modules/export/types — kept local to
// avoid a lib → module-export boundary violation.
export type ManuscriptProfileId =
	| 'standard_manuscript'
	| 'reader_copy'
	| 'ebook_draft'
	| 'plain_text_archive';

export type ExportFormatDefault = 'markdown' | 'docx' | 'epub';

interface ExportDefaults {
	profileId: ManuscriptProfileId;
	format: ExportFormatDefault;
}

const DEFAULTS: ExportDefaults = {
	profileId: 'standard_manuscript',
	format: 'markdown',
};

const PREF_KEY = 'export.defaults';

function createExportDefaults() {
	let profileId = $state<ManuscriptProfileId>('standard_manuscript');
	let format = $state<ExportFormatDefault>('markdown');

	async function hydrate(): Promise<void> {
		const saved = await getPreference<ExportDefaults>(PREF_KEY, DEFAULTS);
		profileId = saved.profileId;
		format = saved.format;
	}

	async function setProfile(next: ManuscriptProfileId): Promise<void> {
		profileId = next;
		await setPreference(PREF_KEY, { profileId, format });
	}

	async function setFormat(next: ExportFormatDefault): Promise<void> {
		format = next;
		await setPreference(PREF_KEY, { profileId, format });
	}

	return {
		get profileId() {
			return profileId;
		},
		get format() {
			return format;
		},
		hydrate,
		setProfile,
		setFormat,
	};
}

export const exportDefaults = createExportDefaults();

import { getPreference, setPreference } from '$lib/preferences.js';

const PREF_KEY = 'app.selectedModel';
const LEGACY_LOCALSTORAGE_KEY = 'novellum_selected_model';
const MIGRATION_FLAG = 'novellum.migration.modelSelection.attempted';

export interface ModelOption {
	id: string;
	label: string;
	provider: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
	{ id: 'google/gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash', provider: 'Google' },
];

const DEFAULT_MODEL = AVAILABLE_MODELS[0].id;

let selectedModelId = $state(DEFAULT_MODEL);
let initialized = false;

/**
 * One-shot upgrade: pre-V1 builds wrote the selected model to
 * `localStorage`. If we still see that entry, copy it to preferences
 * and clear the local copy.
 */
async function migrateLegacyValue(storage: Storage): Promise<string | null> {
	if (storage.getItem(MIGRATION_FLAG) === 'true') return null;
	const legacy = storage.getItem(LEGACY_LOCALSTORAGE_KEY);
	storage.setItem(MIGRATION_FLAG, 'true');
	if (!legacy) return null;
	if (!AVAILABLE_MODELS.some((m) => m.id === legacy)) {
		storage.removeItem(LEGACY_LOCALSTORAGE_KEY);
		return null;
	}
	try {
		await setPreference(PREF_KEY, legacy);
		storage.removeItem(LEGACY_LOCALSTORAGE_KEY);
		return legacy;
	} catch {
		// Leave the legacy entry in place so we retry on next launch.
		return null;
	}
}

/**
 * Initialise the store. Safe to call multiple times — only the first
 * call performs any I/O. Returns the resolved model id.
 */
export async function initModelSelection(): Promise<string> {
	if (initialized) return selectedModelId;
	initialized = true;

	if (typeof window === 'undefined') return selectedModelId;

	const storage = typeof localStorage !== 'undefined' ? localStorage : null;
	if (storage) {
		const migrated = await migrateLegacyValue(storage);
		if (migrated) selectedModelId = migrated;
	}

	const remote = await getPreference<string>(PREF_KEY, selectedModelId);
	if (remote && AVAILABLE_MODELS.some((m) => m.id === remote)) {
		selectedModelId = remote;
	}
	return selectedModelId;
}

// Auto-init on first browser load. Tests can call initModelSelection()
// explicitly with a controlled environment.
if (typeof window !== 'undefined') {
	void initModelSelection();
}

export function getSelectedModel(): string {
	return selectedModelId;
}

export function getSelectedModelOption(): ModelOption {
	return AVAILABLE_MODELS.find((m) => m.id === selectedModelId) ?? AVAILABLE_MODELS[0];
}

export function setSelectedModel(modelId: string): void {
	const valid = AVAILABLE_MODELS.some((m) => m.id === modelId);
	if (!valid) return;
	selectedModelId = modelId;
	if (typeof window !== 'undefined') {
		void setPreference(PREF_KEY, modelId);
	}
}

/** Test-only reset hook. */
export function __resetModelSelectionForTests(): void {
	initialized = false;
	selectedModelId = DEFAULT_MODEL;
}

export const __PREF_KEY = PREF_KEY;
export const __LEGACY_LOCALSTORAGE_KEY = LEGACY_LOCALSTORAGE_KEY;
export const __MIGRATION_FLAG = MIGRATION_FLAG;

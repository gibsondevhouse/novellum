/**
 * Keymap Registry — core keyboard shortcut definitions and persistence.
 *
 * Plain TypeScript module (not .svelte.ts) — no reactive state.
 * Consumers call `listActions()` and assign to a `$state` variable in their
 * component, then refresh after each mutation.
 *
 * Prefer this over a .svelte.ts store because shortcuts live in `$lib` and
 * must be importable by routes and lib modules without Svelte context.
 */
import { getPreference, setPreference } from '$lib/preferences.js';

const PREF_KEY = 'app.shortcuts.bindings';

const DENY_LIST = new Set([
	'Meta+Q',
	'Meta+W',
	'Meta+H',
	'Meta+M',
	'Meta+Tab',
	'Alt+F4',
]);

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ActionDef {
	id: string;
	label: string;
	description: string;
	default: string;
}

export interface ActionEntry extends ActionDef {
	/** Resolved binding: custom override when set, otherwise the default. */
	current: string;
}

export type SaveResult = { ok: true } | { ok: false; error: 'denied' | 'conflict' };

// ── Module-level state ────────────────────────────────────────────────────────

const registry = new Map<string, ActionDef>();
let customBindings: Record<string, string> = {};

// ── Core API ──────────────────────────────────────────────────────────────────

/**
 * Register a new action. Idempotent — silently skips duplicate ids.
 */
export function registerAction(def: ActionDef): void {
	if (registry.has(def.id)) return;
	registry.set(def.id, def);
}

/**
 * Return the current binding for `id`.
 * Returns `''` for unknown action ids.
 */
export function getBinding(id: string): string {
	const def = registry.get(id);
	if (!def) return '';
	return customBindings[id] ?? def.default;
}

/**
 * Return all registered actions with their resolved current bindings.
 */
export function listActions(): ActionEntry[] {
	return Array.from(registry.values()).map((def) => ({
		...def,
		current: customBindings[def.id] ?? def.default,
	}));
}

/**
 * Check whether `combo` is already bound to a different action.
 *
 * Returns the conflicting action id, or `null` if there is no conflict.
 * A self-match (same combo for the same action) is not a conflict.
 */
export function hasConflict(actionId: string, combo: string): string | null {
	for (const [id, def] of registry.entries()) {
		if (id === actionId) continue;
		const current = customBindings[id] ?? def.default;
		if (current === combo) return id;
	}
	return null;
}

/**
 * Persist a new binding for `actionId`.
 *
 * Validates against the deny-list and conflict rules before persisting.
 * Returns `{ ok: true }` on success or `{ ok: false, error }` on rejection.
 * Neither deny-list nor conflict rejections call `setPreference`.
 */
export async function saveBinding(actionId: string, combo: string): Promise<SaveResult> {
	if (DENY_LIST.has(combo)) return { ok: false, error: 'denied' };
	const conflict = hasConflict(actionId, combo);
	if (conflict !== null) return { ok: false, error: 'conflict' };
	customBindings = { ...customBindings, [actionId]: combo };
	await setPreference<Record<string, string>>(PREF_KEY, customBindings);
	return { ok: true };
}

/**
 * Remove the custom binding for `id`, reverting it to the default.
 * Persists the updated bindings object.
 */
export async function resetBinding(id: string): Promise<void> {
	const next = { ...customBindings };
	delete next[id];
	customBindings = next;
	await setPreference<Record<string, string>>(PREF_KEY, customBindings);
}

/**
 * Clear all custom bindings and persist the empty state.
 */
export async function resetAll(): Promise<void> {
	customBindings = {};
	await setPreference<Record<string, string>>(PREF_KEY, {});
}

/**
 * Fetch `app.shortcuts.bindings` from the preference store and populate
 * the module-level `customBindings` record.
 *
 * Call this once from `onMount` in the shortcuts settings page.
 */
export async function loadSavedBindings(): Promise<void> {
	const saved = await getPreference<Record<string, string>>(PREF_KEY, {});
	customBindings = { ...saved };
}

/** Alias — matches the name used in the exit-criteria checklist. */
export const loadBindings = loadSavedBindings;

// ── Core action registration (module-load side effect) ────────────────────────

registerAction({
	id: 'new-project',
	label: 'New Project',
	description: 'Create a new project',
	default: 'Meta+N',
});

registerAction({
	id: 'open-settings',
	label: 'Open Settings',
	description: 'Open the settings panel',
	default: 'Meta+,',
});

registerAction({
	id: 'toggle-sidebar',
	label: 'Toggle Sidebar',
	description: 'Show or hide the sidebar',
	default: 'Meta+B',
});

registerAction({
	id: 'save-scene',
	label: 'Save Scene',
	description: 'Save the current scene',
	default: 'Meta+S',
});

registerAction({
	id: 'view-in-reader',
	label: 'View in Reader',
	description: 'Open the current project in the reader',
	default: 'Meta+R',
});

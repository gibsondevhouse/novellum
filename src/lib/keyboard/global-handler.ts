/**
 * Global keyboard shortcut dispatcher.
 *
 * Wires the shortcuts registered in `keymap-registry.ts` to real app
 * behavior. Installed once from the root `+layout.svelte` on mount.
 *
 * Architecture
 * ------------
 * - Navigation actions (`open-settings`, `new-project`) call `goto()`
 *   directly so they always work, regardless of which route is active.
 * - Stateful actions (`toggle-sidebar`) mutate a shared store.
 * - Route-local actions (`save-scene`, `view-in-reader`) dispatch a
 *   CustomEvent on `window`. Components that own the behavior listen
 *   on `window` and run the action only when they are mounted.
 *
 * Combo canonicalisation matches the recorder in
 * `src/routes/settings/shortcuts/+page.svelte` so a key registered
 * through the UI fires the same handler here.
 */

import { goto } from '$app/navigation';
import { loadSavedBindings, listActions } from './keymap-registry.js';
import { sidebar } from '$lib/stores/sidebar.svelte.js';

/**
 * CustomEvent name dispatched on `window` for shortcut actions that have
 * route-local consumers (editor save, view-in-reader, ...).
 *
 * Listeners receive `{ detail: { actionId: string } }`.
 */
export const SHORTCUT_EVENT = 'novellum:shortcut';

export interface ShortcutEventDetail {
	actionId: string;
}

/**
 * Build a canonical "Meta+Shift+K"-style combo string from a KeyboardEvent.
 * Returns null when the pressed key is a bare modifier.
 *
 * Mirrors the recorder in the shortcuts settings page so combos round-trip
 * unchanged between recording and dispatch.
 */
function buildCombo(e: KeyboardEvent): string | null {
	const MODIFIER_KEYS = new Set(['Meta', 'Control', 'Alt', 'Shift', 'CapsLock', 'Tab']);
	if (MODIFIER_KEYS.has(e.key)) return null;

	const parts: string[] = [];
	if (e.metaKey || e.ctrlKey) parts.push('Meta');
	if (e.altKey) parts.push('Alt');
	if (e.shiftKey) parts.push('Shift');
	parts.push(e.key);
	return parts.join('+');
}

/**
 * Returns true when the active element is an input surface that should
 * receive the keystroke instead of the global handler — but only for
 * combos that don't include a primary modifier (Meta/Ctrl/Alt). All
 * registered shortcuts use a primary modifier, so they pre-empt typing.
 */
function isInputTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	const tag = target.tagName;
	if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
	if (target.isContentEditable) return true;
	return false;
}

/**
 * Build a lookup from `combo → actionId` based on the registry's current
 * state. Rebuilt on every keypress is cheap (≤ 10 entries) and avoids
 * stale-binding bugs when the user re-records a shortcut without reload.
 */
function comboMap(): Map<string, string> {
	const map = new Map<string, string>();
	for (const action of listActions()) {
		map.set(action.current, action.id);
	}
	return map;
}

function dispatchActionEvent(actionId: string): void {
	window.dispatchEvent(
		new CustomEvent<ShortcutEventDetail>(SHORTCUT_EVENT, { detail: { actionId } }),
	);
}

function runAction(actionId: string): void {
	switch (actionId) {
		case 'open-settings':
			void goto('/settings');
			return;
		case 'new-project':
			// `/books?create=1` is the existing entry point used by the
			// header "+" button; the books page auto-opens the dialog.
			void goto('/books?create=1');
			return;
		case 'toggle-sidebar':
			sidebar.toggle();
			return;
		case 'save-scene':
		case 'view-in-reader':
			// Editor-local: the editor pane subscribes to `SHORTCUT_EVENT`
			// and runs the appropriate handler only when it is mounted.
			dispatchActionEvent(actionId);
			return;
		default:
			// Unknown action — still emit the event so future consumers can
			// hook in without round-tripping through this switch.
			dispatchActionEvent(actionId);
	}
}

/**
 * Install the global keydown listener. Returns an `uninstall` function.
 *
 * Loads persisted bindings on first call. Subsequent shortcut edits in
 * the settings page mutate the in-memory registry and are picked up on
 * the next keypress (no reinstall required).
 */
export function installGlobalShortcuts(): () => void {
	if (typeof window === 'undefined') return () => {};

	// Fire-and-forget; the registry falls back to default bindings until
	// the saved bindings resolve.
	void loadSavedBindings();

	const handler = (event: KeyboardEvent) => {
		// Global shortcuts always require a primary modifier so we don't
		// hijack typing in inputs / contentEditable surfaces.
		const hasPrimaryModifier = event.metaKey || event.ctrlKey || event.altKey;
		if (!hasPrimaryModifier) return;

		const combo = buildCombo(event);
		if (!combo) return;

		const map = comboMap();
		const actionId = map.get(combo);
		if (!actionId) return;

		// Found a match — let the page focus stay where it is, but
		// suppress the default browser behavior (Cmd+S → save page, etc.).
		if (isInputTarget(event.target) && (combo === 'Meta+,' || combo === 'Meta+B')) {
			// Allow these in inputs too — they aren't typing characters.
		}
		event.preventDefault();
		event.stopPropagation();
		runAction(actionId);
	};

	window.addEventListener('keydown', handler, { capture: true });
	return () => window.removeEventListener('keydown', handler, { capture: true });
}

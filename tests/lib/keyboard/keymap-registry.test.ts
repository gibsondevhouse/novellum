/**
 * Unit tests for src/lib/keyboard/keymap-registry.ts
 *
 * Uses vi.resetModules() + dynamic import to get a fresh module state
 * for each test, since the module registers 5 core actions at load time.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// These mocks are declared before vi.mock() so the factory can close over them.
const getPreferenceMock = vi.fn();
const setPreferenceMock = vi.fn();

vi.mock('$lib/preferences.js', () => ({
	getPreference: (...args: unknown[]) => getPreferenceMock(...args),
	setPreference: (...args: unknown[]) => setPreferenceMock(...args),
	deletePreference: vi.fn(),
}));

describe('keymap-registry', () => {
	// Use a local reference refreshed per-test via dynamic import after resetModules.
	let registry: typeof import('$lib/keyboard/keymap-registry.js');

	beforeEach(async () => {
		vi.resetModules();
		getPreferenceMock.mockReset();
		setPreferenceMock.mockReset();
		setPreferenceMock.mockResolvedValue(undefined);
		getPreferenceMock.mockResolvedValue({});
		registry = await import('$lib/keyboard/keymap-registry.js');
	});

	// ── listActions ───────────────────────────────────────────────────────────

	it('listActions returns 5 core actions on fresh module load', () => {
		expect(registry.listActions()).toHaveLength(5);
	});

	it('listActions entries include correct ids', () => {
		const ids = registry.listActions().map((a: { id: string }) => a.id);
		expect(ids).toEqual(
			expect.arrayContaining([
				'new-project',
				'open-settings',
				'toggle-sidebar',
				'save-scene',
				'view-in-reader',
			]),
		);
	});

	// ── getBinding ────────────────────────────────────────────────────────────

	it('getBinding returns default for action with no custom binding', () => {
		expect(registry.getBinding('save-scene')).toBe('Meta+S');
		expect(registry.getBinding('new-project')).toBe('Meta+N');
		expect(registry.getBinding('open-settings')).toBe('Meta+,');
	});

	it('getBinding returns empty string for unknown action id', () => {
		expect(registry.getBinding('non-existent')).toBe('');
	});

	// ── saveBinding ───────────────────────────────────────────────────────────

	it('saveBinding persists via setPreference and returns ok:true', async () => {
		const result = await registry.saveBinding('new-project', 'Meta+Shift+N');
		expect(result).toEqual({ ok: true });
		expect(setPreferenceMock).toHaveBeenCalledOnce();
		expect(setPreferenceMock).toHaveBeenCalledWith('app.shortcuts.bindings', {
			'new-project': 'Meta+Shift+N',
		});
	});

	it('saveBinding updates getBinding to the new value', async () => {
		await registry.saveBinding('save-scene', 'Meta+Shift+S');
		expect(registry.getBinding('save-scene')).toBe('Meta+Shift+S');
	});

	it('saveBinding reflects the new binding in listActions', async () => {
		await registry.saveBinding('toggle-sidebar', 'Meta+Shift+B');
		const entry = registry.listActions().find((a: { id: string; current: string }) => a.id === 'toggle-sidebar');
		expect(entry?.current).toBe('Meta+Shift+B');
	});

	// ── Deny-list ─────────────────────────────────────────────────────────────

	it('saveBinding rejects a deny-listed combo and does NOT call setPreference', async () => {
		const result = await registry.saveBinding('new-project', 'Meta+Q');
		expect(result).toEqual({ ok: false, error: 'denied' });
		expect(setPreferenceMock).not.toHaveBeenCalled();
	});

	it('saveBinding rejects all deny-listed combos', async () => {
		const denied = ['Meta+Q', 'Meta+W', 'Meta+H', 'Meta+M', 'Meta+Tab', 'Alt+F4'];
		for (const combo of denied) {
			const result = await registry.saveBinding('new-project', combo);
			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error).toBe('denied');
		}
		expect(setPreferenceMock).not.toHaveBeenCalled();
	});

	// ── hasConflict ───────────────────────────────────────────────────────────

	it('hasConflict returns conflict actionId when combo is taken by another action', () => {
		// Meta+S is the default for save-scene; checking from the perspective of new-project
		expect(registry.hasConflict('new-project', 'Meta+S')).toBe('save-scene');
	});

	it('hasConflict returns conflict actionId for any default binding cross-match', () => {
		expect(registry.hasConflict('save-scene', 'Meta+N')).toBe('new-project');
		expect(registry.hasConflict('save-scene', 'Meta+,')).toBe('open-settings');
		expect(registry.hasConflict('save-scene', 'Meta+B')).toBe('toggle-sidebar');
		expect(registry.hasConflict('save-scene', 'Meta+R')).toBe('view-in-reader');
	});

	it('hasConflict returns null for a self-match (re-saving same combo to same action)', () => {
		// Meta+N is the binding of new-project itself — not a conflict
		expect(registry.hasConflict('new-project', 'Meta+N')).toBeNull();
	});

	it('hasConflict returns null when combo is not used by any action', () => {
		expect(registry.hasConflict('new-project', 'Meta+Shift+Z')).toBeNull();
	});

	it('saveBinding rejects a conflicting combo and does NOT call setPreference', async () => {
		// Meta+S belongs to save-scene; trying to assign it to new-project
		const result = await registry.saveBinding('new-project', 'Meta+S');
		expect(result).toEqual({ ok: false, error: 'conflict' });
		expect(setPreferenceMock).not.toHaveBeenCalled();
	});

	it('hasConflict checks custom bindings, not just defaults', async () => {
		await registry.saveBinding('new-project', 'Meta+Shift+N');
		// Now Meta+Shift+N is taken by new-project; open-settings should conflict
		expect(registry.hasConflict('open-settings', 'Meta+Shift+N')).toBe('new-project');
	});

	// ── resetBinding ──────────────────────────────────────────────────────────

	it('resetBinding restores the default and persists', async () => {
		await registry.saveBinding('save-scene', 'Meta+Shift+S');
		setPreferenceMock.mockClear();

		await registry.resetBinding('save-scene');

		expect(registry.getBinding('save-scene')).toBe('Meta+S');
		expect(setPreferenceMock).toHaveBeenCalledOnce();
	});

	it('resetBinding removes the key from the persisted object', async () => {
		await registry.saveBinding('save-scene', 'Meta+Shift+S');
		setPreferenceMock.mockClear();

		await registry.resetBinding('save-scene');

		// The persisted value should not contain save-scene
		const persisted = setPreferenceMock.mock.calls[0]?.[1] as Record<string, string>;
		expect(persisted).not.toHaveProperty('save-scene');
	});

	// ── resetAll ──────────────────────────────────────────────────────────────

	it('resetAll clears all custom bindings and persists empty object', async () => {
		await registry.saveBinding('save-scene', 'Meta+Shift+S');
		await registry.saveBinding('view-in-reader', 'Meta+Shift+R');
		setPreferenceMock.mockClear();

		await registry.resetAll();

		expect(registry.getBinding('save-scene')).toBe('Meta+S');
		expect(registry.getBinding('view-in-reader')).toBe('Meta+R');
		expect(setPreferenceMock).toHaveBeenCalledOnce();
		expect(setPreferenceMock).toHaveBeenCalledWith('app.shortcuts.bindings', {});
	});

	// ── loadSavedBindings ─────────────────────────────────────────────────────

	it('loadSavedBindings populates custom bindings from preferences', async () => {
		getPreferenceMock.mockResolvedValue({ 'save-scene': 'Meta+Shift+S' });
		await registry.loadSavedBindings();
		expect(registry.getBinding('save-scene')).toBe('Meta+Shift+S');
	});

	it('loadSavedBindings falls back to defaults when preferences returns empty', async () => {
		getPreferenceMock.mockResolvedValue({});
		await registry.loadSavedBindings();
		expect(registry.getBinding('save-scene')).toBe('Meta+S');
	});

	it('loadSavedBindings replaces previously loaded custom bindings', async () => {
		getPreferenceMock.mockResolvedValue({ 'save-scene': 'Meta+Shift+S' });
		await registry.loadSavedBindings();
		expect(registry.getBinding('save-scene')).toBe('Meta+Shift+S');

		// Load again with a different set
		getPreferenceMock.mockResolvedValue({});
		await registry.loadSavedBindings();
		expect(registry.getBinding('save-scene')).toBe('Meta+S');
	});

	it('loadBindings is an alias for loadSavedBindings', () => {
		expect(registry.loadBindings).toBe(registry.loadSavedBindings);
	});

	// ── registerAction ────────────────────────────────────────────────────────

	it('registerAction is idempotent (double register does not duplicate)', () => {
		const before = registry.listActions().length;
		registry.registerAction({
			id: 'save-scene',
			label: 'Save Scene (dupe)',
			description: 'Duplicate attempt',
			default: 'Meta+Z',
		});
		expect(registry.listActions()).toHaveLength(before);
	});

	it('registerAction adds a new action when id is unknown', () => {
		const before = registry.listActions().length;
		registry.registerAction({
			id: 'custom-action',
			label: 'Custom',
			description: 'A custom action',
			default: 'Meta+Shift+C',
		});
		expect(registry.listActions()).toHaveLength(before + 1);
		expect(registry.getBinding('custom-action')).toBe('Meta+Shift+C');
	});
});

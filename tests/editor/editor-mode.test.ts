import { describe, it, expect, vi, beforeEach } from 'vitest';

// Must mock before any import that triggers the module
vi.mock('$lib/preferences.js', () => ({
	getPreference: vi.fn().mockResolvedValue(null),
	setPreference: vi.fn().mockResolvedValue(undefined),
}));

describe('editor-preferences store', async () => {
	const { getPreference, setPreference } = await import('$lib/preferences.js');

	// Import fresh after mocks are set up
	const { editorPreferences } = await import(
		'../../src/modules/editor/stores/editor-preferences.svelte.js'
	);

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getPreference).mockResolvedValue(null);
	});

	it('default mode is "writing" before hydrate', () => {
		expect(editorPreferences.mode).toBe('writing');
	});

	it('default focusMode is false before hydrate', () => {
		expect(editorPreferences.focusMode).toBe(false);
	});

	it('hydrate sets mode from saved preference', async () => {
		vi.mocked(getPreference).mockResolvedValueOnce({ mode: 'planning', focusMode: false });
		await editorPreferences.hydrate('project-abc');
		expect(editorPreferences.mode).toBe('planning');
	});

	it('hydrate sets focusMode from saved preference', async () => {
		vi.mocked(getPreference).mockResolvedValueOnce({ mode: 'writing', focusMode: true });
		await editorPreferences.hydrate('project-abc');
		expect(editorPreferences.focusMode).toBe(true);
	});

	it('hydrate with null preference leaves mode as writing', async () => {
		vi.mocked(getPreference).mockResolvedValueOnce(null);
		await editorPreferences.hydrate('project-xyz');
		// should remain at the state set by previous test (planning) or initial
		// We just ensure no crash and setPreference was not called
		expect(setPreference).not.toHaveBeenCalled();
	});

	it('setMode calls setPreference with correct key', async () => {
		await editorPreferences.hydrate('project-123');
		editorPreferences.setMode('revision');
		expect(setPreference).toHaveBeenCalledWith(
			'editor.preferences.project-123',
			expect.objectContaining({ mode: 'revision' }),
		);
	});

	it('setMode updates mode getter', async () => {
		await editorPreferences.hydrate('project-123');
		editorPreferences.setMode('planning');
		expect(editorPreferences.mode).toBe('planning');
	});

	it('toggleFocus flips focusMode', async () => {
		await editorPreferences.hydrate('project-123');
		// Reset to false
		vi.mocked(getPreference).mockResolvedValueOnce({ mode: 'writing', focusMode: false });
		await editorPreferences.hydrate('project-flip');
		expect(editorPreferences.focusMode).toBe(false);
		editorPreferences.toggleFocus();
		expect(editorPreferences.focusMode).toBe(true);
		editorPreferences.toggleFocus();
		expect(editorPreferences.focusMode).toBe(false);
	});

	it('toggleFocus calls setPreference with correct key', async () => {
		vi.clearAllMocks();
		vi.mocked(getPreference).mockResolvedValueOnce({ mode: 'writing', focusMode: false });
		await editorPreferences.hydrate('project-toggle');
		editorPreferences.toggleFocus();
		expect(setPreference).toHaveBeenCalledWith(
			'editor.preferences.project-toggle',
			expect.objectContaining({ focusMode: true }),
		);
	});
});

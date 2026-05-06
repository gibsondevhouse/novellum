import { getPreference, setPreference } from '$lib/preferences.js';

export type EditorMode = 'writing' | 'planning' | 'revision';

function createEditorPreferences() {
	let mode = $state<EditorMode>('writing');
	let focusMode = $state(false);
	let currentProjectId = $state<string | null>(null);

	async function hydrate(projectId: string) {
		currentProjectId = projectId;
		const saved = await getPreference<{ mode: EditorMode; focusMode: boolean } | null>(
			`editor.preferences.${projectId}`,
			null,
		);
		if (saved) {
			mode = saved.mode ?? 'writing';
			focusMode = saved.focusMode ?? false;
		}
	}

	function setMode(next: EditorMode) {
		mode = next;
		if (currentProjectId) {
			void setPreference(`editor.preferences.${currentProjectId}`, { mode, focusMode });
		}
	}

	function toggleFocus() {
		focusMode = !focusMode;
		if (currentProjectId) {
			void setPreference(`editor.preferences.${currentProjectId}`, { mode, focusMode });
		}
	}

	return {
		get mode() {
			return mode;
		},
		get focusMode() {
			return focusMode;
		},
		hydrate,
		setMode,
		toggleFocus,
	};
}

export const editorPreferences = createEditorPreferences();

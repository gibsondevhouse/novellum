// Svelte 5 rune store — lib-scoped backward-compat shim
// Authoritative state lives in src/modules/editor/stores/editor.svelte.ts
class EditorStoreShim {
	activeSceneId: string | null = $state(null);
}

export const editorShim = new EditorStoreShim();

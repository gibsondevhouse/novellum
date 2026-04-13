// Svelte 5 rune store — lib-scoped backward-compat shim
// Authoritative state lives in src/modules/editor/stores/editor.svelte.ts
let activeSceneId: string | null = $state(null);

export function getActiveSceneId() { return activeSceneId;}

export function setActiveScene(sceneId: string | null): void {
	activeSceneId = sceneId;
}


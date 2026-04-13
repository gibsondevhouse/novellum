import type { Scene } from '$lib/db/types.js';

// Svelte 5 rune store for Editor module
let activeProjectId: string | null = $state(null);
let activeChapterId: string | null = $state(null);
let activeSceneId: string | null = $state(null);
let activeBeatId: string | null = $state(null);
let isLoading: boolean = $state(false);

// Full scene object and pending editor content
let activeScene: Scene | null = $state(null);
let pendingText: string = $state('');

const hasActiveScene = $derived(activeSceneId !== null);

export function setActiveScene(sceneId: string | null): void {
	activeSceneId = sceneId;
}
export function setActiveBeat(beatId: string | null): void {
	activeBeatId = beatId;
}
export function setActiveProject(projectId: string | null): void {
	activeProjectId = projectId;
}
export function setActiveChapter(chapterId: string | null): void {
	activeChapterId = chapterId;
}
export function setLoading(v: boolean): void {
	isLoading = v;
}

export function getActiveSceneId() {
	return activeSceneId;
}
export function getActiveProjectId() {
	return activeProjectId;
}
export function getActiveChapterId() {
	return activeChapterId;
}
export function getActiveBeatId() {
	return activeBeatId;
}
export function getIsLoading() {
	return isLoading;
}
export function getHasActiveScene() {
	return hasActiveScene;
}

export const editorStore = {
	get activeScene() {
		return activeScene;
	},
	get pendingText() {
		return pendingText;
	},
	setActiveScene(scene: Scene): void {
		activeScene = scene;
		activeSceneId = scene.id;
		pendingText = scene.content ?? '';
	},
	setPendingText(text: string): void {
		pendingText = text;
	},
};

export const SCENE_CONTENT_APPLIED_EVENT = 'novellum:scene-content-applied';

export type SceneContentAppliedDetail = {
	projectId: string;
	sceneId: string;
	content: string;
	wordCount: number;
	updatedAt: string;
};

export function dispatchSceneContentApplied(detail: SceneContentAppliedDetail): void {
	if (typeof window === 'undefined') return;
	window.dispatchEvent(new CustomEvent<SceneContentAppliedDetail>(SCENE_CONTENT_APPLIED_EVENT, { detail }));
}


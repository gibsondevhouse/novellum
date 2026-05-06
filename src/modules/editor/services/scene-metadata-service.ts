import { getProjectMetadata, setProjectMetadata } from '$lib/project-metadata.js';

export interface SceneClarity {
	pov?: string;
	location?: string;
	participants?: string[];
}

export interface QuickIntent {
	goal?: string;
	conflict?: string;
	outcome?: string;
}

const ENTITY_TYPE = 'scene' as const;

export async function loadSceneClarity(
	projectId: string,
	sceneId: string,
): Promise<SceneClarity> {
	return getProjectMetadata<SceneClarity>(projectId, ENTITY_TYPE, sceneId, 'clarity', {});
}

export async function saveSceneClarity(
	projectId: string,
	sceneId: string,
	data: SceneClarity,
): Promise<void> {
	await setProjectMetadata(projectId, ENTITY_TYPE, sceneId, 'clarity', data);
}

export async function loadQuickIntent(
	projectId: string,
	sceneId: string,
): Promise<QuickIntent> {
	return getProjectMetadata<QuickIntent>(projectId, ENTITY_TYPE, sceneId, 'quick-intent', {});
}

export async function saveQuickIntent(
	projectId: string,
	sceneId: string,
	data: QuickIntent,
): Promise<void> {
	await setProjectMetadata(projectId, ENTITY_TYPE, sceneId, 'quick-intent', data);
}

import { apiGet } from '$lib/api-client.js';
import { ApiError } from '$lib/api-client.js';
import type { Scene, Project, Beat, Character } from '$lib/db/domain-types';

// Legacy shape — superseded by AiContext in context-engine.ts
interface LegacyAiContext {
	sceneText: string;
	precedingBeat?: string;
	followingBeat?: string;
	characters: string[];
	projectTitle: string;
}

async function getOrUndefined<T>(path: string): Promise<T | undefined> {
	try {
		return await apiGet<T>(path);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

export async function buildContext(projectId: string, sceneId: string): Promise<LegacyAiContext> {
	const [scene, project, allBeats, characters] = await Promise.all([
		getOrUndefined<Scene>(`/api/db/scenes/${sceneId}`),
		getOrUndefined<Project>(`/api/db/projects/${projectId}`),
		apiGet<Beat[]>('/api/db/beats', { projectId }),
		apiGet<Character[]>('/api/db/characters', { projectId }),
	]);

	if (!scene || !project) throw new Error('Scene or project not found');

	const sortedBeats = [...allBeats].sort((a, b) => a.order - b.order);

	// Find beats adjacent to this scene (by id match or by index as fallback)
	const beatIndex = sortedBeats.findIndex((b) => b.id === scene.id);
	const precedingBeat = beatIndex > 0 ? sortedBeats[beatIndex - 1].title : undefined;
	const followingBeat =
		beatIndex >= 0 && beatIndex < sortedBeats.length - 1
			? sortedBeats[beatIndex + 1].title
			: undefined;

	const mentionedChars = characters
		.filter((c) => scene.content.toLowerCase().includes(c.name.toLowerCase()))
		.map((c) => c.name);

	return {
		sceneText: scene.content,
		precedingBeat,
		followingBeat,
		characters: mentionedChars,
		projectTitle: project.title,
	};
}

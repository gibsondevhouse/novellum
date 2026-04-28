import { db } from '$lib/legacy/dexie/db';

// Legacy shape — superseded by AiContext in context-engine.ts
interface LegacyAiContext {
	sceneText: string;
	precedingBeat?: string;
	followingBeat?: string;
	characters: string[];
	projectTitle: string;
}

export async function buildContext(projectId: string, sceneId: string): Promise<LegacyAiContext> {
	const [scene, project, allBeats, characters] = await Promise.all([
		db.scenes.get(sceneId),
		db.projects.get(projectId),
		db.beats.where('projectId').equals(projectId).sortBy('order'),
		db.characters.where('projectId').equals(projectId).toArray(),
	]);

	if (!scene || !project) throw new Error('Scene or project not found');

	// Find beats adjacent to this scene (by id match or by index as fallback)
	const beatIndex = allBeats.findIndex((b) => b.id === scene.id);
	const precedingBeat = beatIndex > 0 ? allBeats[beatIndex - 1].title : undefined;
	const followingBeat =
		beatIndex >= 0 && beatIndex < allBeats.length - 1 ? allBeats[beatIndex + 1].title : undefined;

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

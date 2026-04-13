import { getProjectById } from '$modules/project/services/project-repository.js';
import { getChaptersByProjectId } from '$modules/project/services/chapter-repository.js';
import { getScenesByChapterId } from '$modules/editor/services/scene-repository.js';
import type { AssembledProject } from '../types.js';

export async function assembleProject(projectId: string): Promise<AssembledProject> {
	const project = await getProjectById(projectId);
	if (!project) throw new Error(`Project not found: ${projectId}`);

	const chapters = await getChaptersByProjectId(projectId);
	// chapters already sorted by order from repository

	const assembledChapters = await Promise.all(
		chapters.map(async (ch) => {
			const scenes = await getScenesByChapterId(ch.id);
			// scenes already sorted by order from repository
			return {
				title: ch.title,
				order: ch.order,
				scenes: scenes.map((s) => s.content ?? ''),
			};
		}),
	);

	return {
		id: project.id,
		title: project.title,
		genre: project.genre ?? '',
		chapters: assembledChapters,
	};
}

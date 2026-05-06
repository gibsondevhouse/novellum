import { getProjectById } from '$modules/project/services/project-repository.js';
import { getChaptersByProjectId } from '$modules/project/services/chapter-repository.js';
import { getScenesByChapterId } from '$modules/editor/services/scene-repository.js';
import type {
	AssembledManuscript,
	AssembledManuscriptChapter,
	AssembledScene,
	ManuscriptCompileOptions,
} from '../types.js';

function countWords(html: string): number {
	const plain = html
		.replace(/<[^>]*>/g, ' ')
		.replace(/&[a-z]+;/gi, ' ')
		.trim();
	if (!plain) return 0;
	return plain.split(/\s+/).filter((w) => w.length > 0).length;
}

export async function assembleManuscript(
	projectId: string,
	options: ManuscriptCompileOptions,
): Promise<AssembledManuscript> {
	const project = await getProjectById(projectId);
	if (!project) throw new Error(`Project not found: ${projectId}`);

	let chapters = await getChaptersByProjectId(projectId);
	// chapters are already sorted by order from the repo

	if (options.selectedChapterIds && options.selectedChapterIds.length > 0) {
		const ids = new Set(options.selectedChapterIds);
		chapters = chapters.filter((c) => ids.has(c.id));
	}

	const assembledChapters: AssembledManuscriptChapter[] = await Promise.all(
		chapters.map(async (chapter) => {
			const scenes = await getScenesByChapterId(chapter.id);
			const assembledScenes: AssembledScene[] = scenes.map((scene) => ({
				id: scene.id,
				title: scene.title ?? '',
				content: scene.content ?? '',
				wordCount: countWords(scene.content ?? ''),
				order: scene.order ?? 0,
			}));
			return {
				id: chapter.id,
				title: chapter.title ?? '',
				order: chapter.order ?? 0,
				scenes: assembledScenes,
			};
		}),
	);

	const totalWordCount = assembledChapters
		.flatMap((c) => c.scenes)
		.reduce((sum, s) => sum + s.wordCount, 0);

	return {
		projectId,
		metadata: options.metadata,
		profileId: options.profileId,
		chapters: assembledChapters,
		totalWordCount,
		compiledAt: new Date().toISOString(),
	};
}

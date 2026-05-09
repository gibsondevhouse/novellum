import {
	mapSceneIdToReaderPageId,
	type ReaderInputChapter,
	type ReaderInputProject,
} from './reader-pages.js';

/**
 * The reader is "empty" when the bound book has no scenes whose
 * `content` contains any non-whitespace text. Cover, title, and
 * TOC pages alone don't justify mounting the pagination engine.
 */
export function hasReadableContent(chapters: ReaderInputChapter[]): boolean {
	return chapters.some((chapter) =>
		chapter.scenes.some(
			(scene) => (scene.content ?? '').replace(/<[^>]*>/g, '').trim().length > 0,
		),
	);
}

/**
 * plan-023 stage-003: reserved query param `?scene=<sceneId>`.
 * Resolve the scene id to a reader page id if applicable.
 */
export function resolveDeepLink(
	project: ReaderInputProject,
	chapters: ReaderInputChapter[],
	sceneIdFromUrl?: string | null,
) {
	const targetSceneId = sceneIdFromUrl || null;
	const targetPageId = targetSceneId
		? mapSceneIdToReaderPageId(targetSceneId, project, chapters)
		: null;

	return { targetSceneId, targetPageId };
}

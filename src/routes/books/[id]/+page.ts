import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getProjectById } from '$modules/project/services/project-repository.js';
import { getChaptersByProjectId } from '$modules/project/services/chapter-repository.js';
import { getScenesByChapterId } from '$modules/editor/services/scene-repository.js';

type ReaderScene = {
	id: string;
	title: string;
	order: number;
	content: string;
};

type ReaderChapter = {
	id: string;
	title: string;
	order: number;
	scenes: ReaderScene[];
};

export const load: PageLoad = async ({ params }) => {
	const project = await getProjectById(params.id);
	if (!project) {
		throw error(404, 'Book not found');
	}

	const chapters = await getChaptersByProjectId(project.id);
	const readerChapters: ReaderChapter[] = await Promise.all(
		chapters.map(async (chapter) => {
			const scenes = await getScenesByChapterId(chapter.id);
			return {
				id: chapter.id,
				title: chapter.title,
				order: chapter.order,
				scenes: scenes.map((scene) => ({
					id: scene.id,
					title: scene.title,
					order: scene.order,
					content: scene.content ?? '',
				})),
			};
		}),
	);

	return {
		project,
		chapters: readerChapters,
	};
};

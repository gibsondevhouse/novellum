import type { PageLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import { getActById } from '$modules/project/services/act-repository.js';
import { getArcById } from '$modules/project/services/arc-repository.js';
import { getChapterById } from '$modules/project/services/chapter-repository.js';
import { getScenesByChapterId } from '$modules/editor/services/scene-repository.js';

export const load: PageLoad = async ({ params, parent }) => {
	const { project } = await parent();
	const chapter = await getChapterById(params.chapterId);

	if (!chapter || chapter.projectId !== project.id) {
		throw error(404, 'Chapter not found');
	}

	const [act, scenes] = await Promise.all([
		chapter.actId ? getActById(chapter.actId) : Promise.resolve(null),
		getScenesByChapterId(params.chapterId),
	]);

	const arc = act?.arcId ? await getArcById(act.arcId) : null;

	return {
		chapter,
		act,
		arc,
		scenes,
		arcSegment: act?.arcId ?? 'unassigned',
		actSegment: chapter.actId ?? 'unassigned',
	};
};

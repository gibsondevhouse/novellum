import type { PageLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import { getActById } from '$modules/project/services/act-repository.js';
import { getArcById } from '$modules/project/services/arc-repository.js';
import { getChaptersByActId } from '$modules/project/services/chapter-repository.js';
import { getScenesByProjectId } from '$modules/editor/services/scene-repository.js';

export const load: PageLoad = async ({ params, parent }) => {
	const { project } = await parent();
	const [act, chapters, scenes] = await Promise.all([
		getActById(params.actId),
		getChaptersByActId(params.actId),
		getScenesByProjectId(project.id),
	]);

	if (!act || act.projectId !== project.id) {
		throw error(404, 'Act not found');
	}

	const arc = act.arcId ? await getArcById(act.arcId) : null;

	return {
		act,
		arc,
		chapters,
		scenes,
		arcSegment: act.arcId ?? 'unassigned',
	};
};

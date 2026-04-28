import type { PageLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import { getArcById } from '$modules/project/services/arc-repository.js';
import {
	getActsByArcId,
	getActsByProjectId,
} from '$modules/project/services/act-repository.js';
import { getChaptersByProjectId } from '$modules/project/services/chapter-repository.js';

export const load: PageLoad = async ({ params, parent }) => {
	const { project } = await parent();
	const arcId = params.arcId;

	if (arcId === 'unassigned') {
		const [acts, chapters] = await Promise.all([
			getActsByProjectId(project.id),
			getChaptersByProjectId(project.id),
		]);
		return {
			arc: null,
			arcId: null,
			acts: acts.filter((a) => !a.arcId),
			chapters,
		};
	}

	const [arc, acts, chapters] = await Promise.all([
		getArcById(arcId),
		getActsByArcId(arcId),
		getChaptersByProjectId(project.id),
	]);

	if (!arc || arc.projectId !== project.id) {
		throw error(404, 'Arc not found');
	}

	return { arc, arcId, acts, chapters };
};

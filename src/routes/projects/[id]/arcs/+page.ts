import type { PageLoad } from './$types.js';
import { getArcsByProjectId } from '$modules/project/services/arc-repository.js';
import { getActsByProjectId } from '$modules/project/services/act-repository.js';

export const load: PageLoad = async ({ parent }) => {
	const { project } = await parent();
	const [arcs, acts] = await Promise.all([
		getArcsByProjectId(project.id),
		getActsByProjectId(project.id),
	]);
	return { arcs, acts };
};

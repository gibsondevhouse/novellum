import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import type { Project } from '$lib/db/domain-types';

export const load: LayoutLoad = async ({ params, fetch }) => {
	const response = await fetch(`/api/db/projects/${params.id}`);

	if (response.status === 404) {
		error(404, `Project "${params.id}" not found`);
	}

	if (!response.ok) {
		error(response.status, 'Failed to load project');
	}

	const project = (await response.json()) as Project;
	return { project };
};

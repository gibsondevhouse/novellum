import type { PageLoad } from './$types';
import { getWorkspaceData } from '$modules/workspace/services/workspace-data-service.js';

export const load: PageLoad = async ({ params }) => {
	const workspace = await getWorkspaceData(params.id);
	return { projectId: params.id, ...workspace };
};

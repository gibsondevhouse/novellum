import type { PageLoad } from './$types';
import type { WorldbuildingDomainId } from '$modules/world-building/worldbuilding-workflow.js';

export interface DomainCounts extends Record<WorldbuildingDomainId, number> {
	personae: number;
	atlas: number;
	archive: number;
	threads: number;
	chronicles: number;
}

export const load: PageLoad = async ({ params, fetch }) => {
	const projectId = params.id;

	const domainCounts = await fetch(`/api/worldbuilding/domain-counts?projectId=${projectId}`)
		.then((r) => (r.ok ? (r.json() as Promise<DomainCounts>) : null))
		.catch(() => null);

	return {
		projectId,
		domainCounts: domainCounts ?? {
			personae: 0,
			atlas: 0,
			archive: 0,
			threads: 0,
			chronicles: 0,
		} satisfies DomainCounts,
	};
};

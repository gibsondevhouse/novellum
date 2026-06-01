import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { WorldbuildingDomainId } from '$modules/world-building/worldbuilding-workflow.js';

export interface DomainCounts extends Record<WorldbuildingDomainId, number> {
	personae: number;
	atlas: number;
	archive: number;
	threads: number;
	chronicles: number;
}

export const load: PageLoad = async ({ params }) => {
	throw redirect(307, `/projects/${params.id}/world-building/characters`);
};

import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	redirect(307, `/projects/${params.id}/world-building/plot-threads`);
};

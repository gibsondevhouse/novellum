import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params, url }) => {
	const search = new URLSearchParams(url.searchParams);
	search.set('sceneId', params.sceneId);

	throw redirect(307, `/projects/${params.id}/editor?${search.toString()}`);
};

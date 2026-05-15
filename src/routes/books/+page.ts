import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { resolveLastReadBookId } from '$lib/navigation-state.js';

export const load: PageLoad = async ({ url }) => {
	if (url.searchParams.has('create')) {
		throw redirect(307, '/projects?create=1');
	}

	const lastRead = await resolveLastReadBookId();
	if ((lastRead.status === 'valid' || lastRead.status === 'error') && lastRead.id) {
		throw redirect(307, `/books/${lastRead.id}`);
	}

	throw redirect(307, '/projects');
};

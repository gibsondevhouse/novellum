import { json } from '@sveltejs/kit';
import { getAppVersion } from '$lib/version.js';

export const GET = () =>
	json({
		appName: 'Novellum',
		version: getAppVersion(),
		license: 'Proprietary — All rights reserved',
		description: 'The writing companion built for fiction authors.',
	});

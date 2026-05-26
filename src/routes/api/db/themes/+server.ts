import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';

const config = {
	table: 'themes',
	fields: {
		projectId: { required: true },
		title: { required: true },
		description: { default: '' },
		tensionPair: { default: '' },
		imagery: { default: '' },
	},
	orderBy: 'title ASC',
	queryParams: ['projectId'],
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

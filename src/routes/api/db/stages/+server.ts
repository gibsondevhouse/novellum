import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';

const config = {
	table: 'stages',
	fields: {
		beatId: { required: true },
		projectId: { required: true },
		title: { required: true },
		description: { default: '' },
		order: { default: 0 },
		status: { default: 'planned' },
	},
	orderBy: '"order" ASC',
	queryParams: ['beatId', 'projectId'],
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';

const config = {
	table: 'acts',
	fields: {
		projectId: { required: true },
		arcId: { default: null },
		title: { required: true },
		order: { default: 0 },
		planningNotes: { default: '' },
	},
	orderBy: '"order" ASC',
	queryParams: ['projectId', 'arcId'],
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

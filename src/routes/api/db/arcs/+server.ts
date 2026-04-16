import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';

const config = {
	table: 'arcs',
	fields: {
		projectId: { required: true },
		title: { required: true },
		description: { default: '' },
		purpose: { default: '' },
		arcType: { default: null },
		order: { default: 0 },
	},
	orderBy: '"order" ASC',
	queryParams: ['projectId'],
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

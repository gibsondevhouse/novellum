import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';

const config = {
	table: 'writing_styles',
	fields: {
		projectId: { required: true },
		title: { required: true },
		description: { default: '' },
		exampleText: { default: '' },
	},
	orderBy: 'createdAt ASC',
	queryParams: ['projectId'],
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

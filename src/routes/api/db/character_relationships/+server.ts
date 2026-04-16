import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';

const config = {
	table: 'character_relationships',
	fields: {
		projectId: { required: true },
		characterAId: { required: true },
		characterBId: { required: true },
		type: { default: '' },
		description: { default: '' },
	},
	orderBy: 'createdAt ASC',
	queryParams: ['projectId', 'characterAId', 'characterBId'],
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

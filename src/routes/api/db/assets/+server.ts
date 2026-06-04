import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';

const config = {
	table: 'assets',
	fields: {
		projectId: { required: true },
		name: { required: true },
		mimeType: { default: '' },
		data: { default: '' },
		sizeBytes: { default: 0 },
	},
	orderBy: 'createdAt ASC',
	queryParams: ['projectId'],
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

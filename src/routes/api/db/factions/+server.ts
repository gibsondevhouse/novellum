import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';

const config = {
	table: 'factions',
	fields: {
		projectId: { required: true },
		name: { required: true },
		type: { default: '' },
		description: { default: '' },
		mission: { default: '' },
		ideology: { default: '' },
	},
	orderBy: 'name ASC',
	queryParams: ['projectId'],
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';

const config = {
	table: 'glossary_terms',
	fields: {
		projectId: { required: true },
		term: { required: true },
		definition: { default: '' },
		pronunciation: { default: '' },
		category: { default: '' },
	},
	orderBy: 'term ASC',
	queryParams: ['projectId'],
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

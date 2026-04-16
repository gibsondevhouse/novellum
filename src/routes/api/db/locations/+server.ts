import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';
import { decodeJson } from '$lib/server/db/index.js';

function decodeRow(row: Record<string, unknown>) {
	return {
		...row,
		tags: decodeJson<string[]>(row.tags as string),
	};
}

const config = {
	table: 'locations',
	fields: {
		projectId: { required: true },
		name: { required: true },
		description: { default: '' },
		tags: { default: [], json: true },
	},
	orderBy: 'createdAt ASC',
	queryParams: ['projectId'],
	decodeRow,
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

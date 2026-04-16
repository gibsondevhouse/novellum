import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';
import { decodeJson } from '$lib/server/db/index.js';

function decodeRow(row: Record<string, unknown>) {
	return {
		...row,
		relatedCharacterIds: decodeJson<string[]>(row.relatedCharacterIds as string),
		relatedSceneIds: decodeJson<string[]>(row.relatedSceneIds as string),
	};
}

const config = {
	table: 'timeline_events',
	fields: {
		projectId: { required: true },
		title: { required: true },
		description: { default: '' },
		date: { default: '' },
		relatedCharacterIds: { default: [], json: true },
		relatedSceneIds: { default: [], json: true },
	},
	orderBy: 'createdAt ASC',
	queryParams: ['projectId'],
	decodeRow,
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

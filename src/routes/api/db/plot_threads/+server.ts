import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';
import { decodeJson } from '$lib/server/db/index.js';

function decodeRow(row: Record<string, unknown>) {
	return {
		...row,
		relatedSceneIds: decodeJson<string[]>(row.relatedSceneIds as string),
		relatedCharacterIds: decodeJson<string[]>(row.relatedCharacterIds as string),
	};
}

const config = {
	table: 'plot_threads',
	fields: {
		projectId: { required: true },
		title: { required: true },
		description: { default: '' },
		status: { default: '' },
		relatedSceneIds: { default: [], json: true },
		relatedCharacterIds: { default: [], json: true },
	},
	orderBy: 'createdAt ASC',
	queryParams: ['projectId'],
	decodeRow,
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

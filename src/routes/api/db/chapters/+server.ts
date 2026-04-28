import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';
import { decodeJson } from '$lib/server/db/index.js';

function decodeRow(row: Record<string, unknown>) {
	return {
		...row,
		arcRefs: decodeJson<{ arcId: string; role: string }[]>(row.arcRefs as string),
	};
}

const config = {
	table: 'chapters',
	fields: {
		projectId: { required: true },
		title: { required: true },
		order: { default: 0 },
		summary: { default: '' },
		wordCount: { default: 0 },
		actId: { default: null },
		arcRefs: { default: [], json: true },
	},
	orderBy: '"order" ASC',
	queryParams: ['projectId', 'actId'],
	decodeRow,
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

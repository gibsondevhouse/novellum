import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';
import { decodeJson } from '$lib/server/db/index.js';

function decodeRow(row: Record<string, unknown>) {
	return {
		...row,
		traits: decodeJson<string[]>(row.traits as string),
		goals: decodeJson<string[]>(row.goals as string),
		flaws: decodeJson<string[]>(row.flaws as string),
		arcs: decodeJson<string[]>(row.arcs as string),
		tags: decodeJson<string[]>(row.tags as string),
	};
}

const config = {
	table: 'characters',
	fields: {
		projectId: { required: true },
		name: { required: true },
		role: { default: '' },
		traits: { default: [], json: true },
		goals: { default: [], json: true },
		flaws: { default: [], json: true },
		arcs: { default: [], json: true },
		notes: { default: '' },
		tags: { default: [], json: true },
	},
	orderBy: 'createdAt ASC',
	queryParams: ['projectId'],
	decodeRow,
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

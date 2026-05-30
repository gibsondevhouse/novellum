import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';
import { decodeJson } from '$lib/server/db/index.js';

function decodeRow(row: Record<string, unknown>) {
	return {
		...row,
		tags: decodeJson<string[]>(row.tags as string),
		notableFeatures: decodeJson<string[]>(row.notableFeatures as string),
		landmarkIds: decodeJson<string[]>(row.landmarkIds as string),
		factionIds: decodeJson<string[]>(row.factionIds as string),
		characterIds: decodeJson<string[]>(row.characterIds as string),
		threadIds: decodeJson<string[]>(row.threadIds as string),
	};
}

const config = {
	table: 'locations',
	fields: {
		projectId: { required: true },
		name: { required: true },
		description: { default: '' },
		tags: { default: [], json: true },
		kind: { default: '' },
		realmType: { default: '' },
		realityRules: { default: '' },
		culturalBaseline: { default: '' },
		powerStructure: { default: '' },
		conflictPressure: { default: '' },
		storyRole: { default: '' },
		tone: { default: '' },
		realmId: { default: '' },
		environment: { default: '' },
		notableFeatures: { default: [], json: true },
		purpose: { default: '' },
		activityType: { default: '' },
		emotionalTone: { default: '' },
		changeOverTime: { default: '' },
		landmarkIds: { default: [], json: true },
		factionIds: { default: [], json: true },
		characterIds: { default: [], json: true },
		threadIds: { default: [], json: true },
	},
	orderBy: 'createdAt ASC',
	queryParams: ['projectId'],
	decodeRow,
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';
import { decodeJson } from '$lib/server/db/index.js';

function decodeRow(row: Record<string, unknown>) {
	return {
		...row,
		characterIds: decodeJson<string[]>(row.characterIds as string),
		locationIds: decodeJson<string[]>(row.locationIds as string),
		arcRefs: decodeJson<{ arcId: string; role: string }[]>(row.arcRefs as string),
	};
}

const config = {
	table: 'scenes',
	fields: {
		chapterId: { required: true },
		projectId: { required: true },
		title: { required: true },
		summary: { default: '' },
		povCharacterId: { default: null },
		locationId: { default: null },
		timelineEventId: { default: null },
		order: { default: 0 },
		content: { default: '' },
		wordCount: { default: 0 },
		characterIds: { default: [], json: true },
		locationIds: { default: [], json: true },
		arcRefs: { default: [], json: true },
	},
	orderBy: '"order" ASC',
	queryParams: ['projectId', 'chapterId'],
	decodeRow,
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

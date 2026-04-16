import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';

const config = {
	table: 'milestones',
	fields: {
		actId: { required: true },
		projectId: { required: true },
		title: { required: true },
		description: { default: '' },
		order: { default: 0 },
		chapterIds: { default: [], json: true },
	},
	orderBy: '"order" ASC',
	queryParams: ['actId', 'projectId'],
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

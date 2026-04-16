import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';

const config = {
	table: 'beats',
	fields: {
		sceneId: { default: null },
		arcId: { default: null },
		projectId: { required: true },
		title: { required: true },
		type: { default: '' },
		order: { default: 0 },
		notes: { default: '' },
	},
	orderBy: '"order" ASC',
	queryParams: ['sceneId', 'arcId', 'projectId'],
	customValidation: (body: Record<string, unknown>) => {
		if (!body.sceneId && !body.arcId) {
			return 'sceneId or arcId is required';
		}
		return null;
	},
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

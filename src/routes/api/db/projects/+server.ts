import { createGetHandler, createPostHandler } from '$lib/server/api-helpers.js';

const config = {
	table: 'projects',
	fields: {
		title: { required: true },
		coverUrl: { default: '' },
		genre: { default: '' },
		logline: { default: '' },
		synopsis: { default: '' },
		targetWordCount: { default: 0 },
		status: { default: 'planning' },
		systemPrompt: { default: '' },
		negativePrompt: { default: '' },
		projectType: { default: 'novel' },
		lastOpenedAt: { default: '' },
		stylePresetId: { default: '' },
	},
	orderBy: 'createdAt DESC',
};

export const GET = createGetHandler(config);
export const POST = createPostHandler(config);

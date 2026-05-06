import { vi, describe, it, expect } from 'vitest';
import { type Mock } from 'vitest';

vi.mock('$modules/editor/services/scene-repository.js', () => ({
	getScenesByProjectId: vi.fn(),
}));

vi.mock('$lib/api-client.js', () => ({
	apiGet: vi.fn(),
}));

import { load } from '../../src/routes/projects/[id]/+page.js';
import { getScenesByProjectId } from '$modules/editor/services/scene-repository.js';
import { apiGet } from '$lib/api-client.js';

type HubLoadResult = Exclude<Awaited<ReturnType<typeof load>>, void>;

describe('projects hub word count', () => {
	it('computes word count from content when wordCount field is 0', async () => {
		(getScenesByProjectId as Mock).mockResolvedValue([
			{ id: 's1', wordCount: 0, content: '<p>Hello world</p>' },
			{ id: 's2', wordCount: 0, content: '<p>Three more words here</p>' },
		]);
		(apiGet as Mock).mockResolvedValue([]);

		const result = await load({ parent: async () => ({ project: { id: 'proj-1' } }) } as Parameters<typeof load>[0]) as HubLoadResult;

		expect(result.currentWordCount).toBe(6);
	});

	it('returns 0 for scenes with null content', async () => {
		(getScenesByProjectId as Mock).mockResolvedValue([
			{ id: 's1', wordCount: 0, content: null },
		]);
		(apiGet as Mock).mockResolvedValue([]);

		const result = await load({ parent: async () => ({ project: { id: 'proj-1' } }) } as Parameters<typeof load>[0]) as HubLoadResult;

		expect(result.currentWordCount).toBe(0);
	});

	it('strips HTML tags before counting', async () => {
		(getScenesByProjectId as Mock).mockResolvedValue([
			{ id: 's1', wordCount: 0, content: '<p class="lead"><strong>One</strong> two</p>' },
		]);
		(apiGet as Mock).mockResolvedValue([]);

		const result = await load({ parent: async () => ({ project: { id: 'proj-1' } }) } as Parameters<typeof load>[0]) as HubLoadResult;

		expect(result.currentWordCount).toBe(2);
	});
});

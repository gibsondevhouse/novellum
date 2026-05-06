import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('$lib/api-client.js', () => ({
	apiGet: vi.fn(),
}));

vi.mock('$lib/preferences.js', () => ({
	getPreference: vi.fn(),
}));

import { getProjectHealth } from '../../src/routes/projects/[id]/services/project-health-service.js';
import { apiGet } from '$lib/api-client.js';
import { getPreference } from '$lib/preferences.js';

function makeScene(overrides: Partial<{ id: string; updatedAt: string; content: string }> = {}) {
	return {
		id: overrides.id ?? 's1',
		chapterId: 'ch1',
		projectId: 'proj1',
		title: 'Scene',
		summary: '',
		povCharacterId: null,
		locationId: null,
		timelineEventId: null,
		order: 0,
		content: overrides.content ?? '',
		wordCount: 0,
		notes: '',
		characterIds: [],
		locationIds: [],
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: overrides.updatedAt ?? '2026-01-01T00:00:00.000Z',
	};
}

describe('getProjectHealth', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(getPreference as Mock).mockResolvedValue(null);
		(apiGet as Mock).mockResolvedValue({ configured: false });
	});

	it('lastSavedAt is the max updatedAt across scenes', async () => {
		(apiGet as Mock).mockImplementation((path: string) => {
			if (path === '/api/db/scenes') {
				return Promise.resolve([
					makeScene({ id: 's1', updatedAt: '2026-03-01T10:00:00.000Z' }),
					makeScene({ id: 's2', updatedAt: '2026-05-01T12:00:00.000Z' }),
					makeScene({ id: 's3', updatedAt: '2026-04-15T08:00:00.000Z' }),
				]);
			}
			return Promise.resolve({ configured: false });
		});

		const result = await getProjectHealth('proj1');
		expect(result.lastSavedAt).toBe('2026-05-01T12:00:00.000Z');
	});

	it('lastSavedAt is null for empty scenes array', async () => {
		(apiGet as Mock).mockImplementation((path: string) => {
			if (path === '/api/db/scenes') return Promise.resolve([]);
			return Promise.resolve({ configured: false });
		});

		const result = await getProjectHealth('proj1');
		expect(result.lastSavedAt).toBeNull();
	});

	it('lastBackupAt returns the preference value', async () => {
		(getPreference as Mock).mockResolvedValue('2026-04-20T09:00:00.000Z');
		(apiGet as Mock).mockImplementation((path: string) => {
			if (path === '/api/db/scenes') return Promise.resolve([]);
			return Promise.resolve({ configured: false });
		});

		const result = await getProjectHealth('proj1');
		expect(result.lastBackupAt).toBe('2026-04-20T09:00:00.000Z');
	});

	it('apiKeyConfigured is true when ai-status returns configured: true', async () => {
		(apiGet as Mock).mockImplementation((path: string) => {
			if (path === '/api/db/scenes') return Promise.resolve([]);
			if (path === '/api/settings/ai-status') return Promise.resolve({ configured: true });
			return Promise.resolve(null);
		});

		const result = await getProjectHealth('proj1');
		expect(result.apiKeyConfigured).toBe(true);
	});

	it('apiKeyConfigured is false when ai-status returns configured: false', async () => {
		(apiGet as Mock).mockImplementation((path: string) => {
			if (path === '/api/db/scenes') return Promise.resolve([]);
			if (path === '/api/settings/ai-status') return Promise.resolve({ configured: false });
			return Promise.resolve(null);
		});

		const result = await getProjectHealth('proj1');
		expect(result.apiKeyConfigured).toBe(false);
	});

	it('wordCount is 0 for scenes with null content', async () => {
		(apiGet as Mock).mockImplementation((path: string) => {
			if (path === '/api/db/scenes') {
				return Promise.resolve([
					makeScene({ id: 's1', content: '' }),
					makeScene({ id: 's2', content: '' }),
				]);
			}
			return Promise.resolve({ configured: false });
		});

		const result = await getProjectHealth('proj1');
		expect(result.wordCount).toBe(0);
	});

	it('wordCount strips HTML and counts words correctly', async () => {
		(apiGet as Mock).mockImplementation((path: string) => {
			if (path === '/api/db/scenes') {
				return Promise.resolve([
					makeScene({ id: 's1', content: '<p>Hello world</p>' }),
					makeScene({ id: 's2', content: '<p>Three more words here</p>' }),
				]);
			}
			return Promise.resolve({ configured: false });
		});

		const result = await getProjectHealth('proj1');
		expect(result.wordCount).toBe(6);
	});

	it('sceneCount reflects number of scenes returned', async () => {
		(apiGet as Mock).mockImplementation((path: string) => {
			if (path === '/api/db/scenes') {
				return Promise.resolve([makeScene({ id: 's1' }), makeScene({ id: 's2' })]);
			}
			return Promise.resolve({ configured: false });
		});

		const result = await getProjectHealth('proj1');
		expect(result.sceneCount).toBe(2);
	});

	it('returns safe defaults when scenes fetch fails', async () => {
		(apiGet as Mock).mockImplementation((path: string) => {
			if (path === '/api/db/scenes') return Promise.reject(new Error('network error'));
			return Promise.resolve({ configured: false });
		});

		const result = await getProjectHealth('proj1');
		expect(result.sceneCount).toBe(0);
		expect(result.wordCount).toBe(0);
		expect(result.lastSavedAt).toBeNull();
	});
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiGet = vi.fn();
const getPreference = vi.fn();
const setPreference = vi.fn();
const deletePreference = vi.fn();

class MockApiError extends Error {
	status: number;
	constructor(message: string, status: number) {
		super(message);
		this.status = status;
	}
}

vi.mock('$lib/api-client.js', () => ({
	ApiError: MockApiError,
	apiGet: (...args: unknown[]) => apiGet(...args),
}));

vi.mock('$lib/preferences.js', () => ({
	getPreference: (...args: unknown[]) => getPreference(...args),
	setPreference: (...args: unknown[]) => setPreference(...args),
	deletePreference: (...args: unknown[]) => deletePreference(...args),
}));

async function loadNavigationState() {
	return await import('../../src/lib/navigation-state.js');
}

describe('navigation-state', () => {
	beforeEach(() => {
		apiGet.mockReset();
		getPreference.mockReset();
		setPreference.mockReset();
		deletePreference.mockReset();
		localStorage.clear();
		vi.resetModules();
	});

	it('resolves a valid cached last project id', async () => {
		localStorage.setItem('novellum_last_project_id', 'proj-valid');
		apiGet.mockResolvedValue({ id: 'proj-valid' });

		const { resolveLastProjectId } = await loadNavigationState();
		const resolved = await resolveLastProjectId();

		expect(resolved).toEqual({ id: 'proj-valid', status: 'valid' });
		expect(deletePreference).not.toHaveBeenCalled();
	});

	it('clears stale last project id when validation returns 404', async () => {
		localStorage.setItem('novellum_last_project_id', 'proj-missing');
		apiGet.mockRejectedValue(new MockApiError('missing', 404));

		const { resolveLastProjectId } = await loadNavigationState();
		const resolved = await resolveLastProjectId();

		expect(resolved).toEqual({ id: null, status: 'invalid' });
		expect(localStorage.getItem('novellum_last_project_id')).toBeNull();
		expect(deletePreference).toHaveBeenCalledWith('app.lastProjectId');
	});

	it('preserves cached last project id on transient validation failures', async () => {
		localStorage.setItem('novellum_last_project_id', 'proj-transient');
		apiGet.mockRejectedValue(new Error('network down'));

		const { resolveLastProjectId } = await loadNavigationState();
		const resolved = await resolveLastProjectId();

		expect(resolved).toEqual({ id: 'proj-transient', status: 'error' });
		expect(localStorage.getItem('novellum_last_project_id')).toBe('proj-transient');
		expect(deletePreference).not.toHaveBeenCalled();
	});

	it('clears stale last-read id when validation returns 404', async () => {
		localStorage.setItem(
			'novellum:reader',
			JSON.stringify({ mode: 'classic', lastBookId: 'book-missing', pageIndex: {} }),
		);
		apiGet.mockRejectedValue(new MockApiError('missing', 404));

		const { resolveLastReadBookId } = await loadNavigationState();
		const resolved = await resolveLastReadBookId();

		expect(resolved).toEqual({ id: null, status: 'invalid' });
		expect(setPreference).toHaveBeenCalledWith('app.readerMode', {
			mode: 'classic',
			lastBookId: null,
			pageIndex: {},
		});
	});

	it('does not clear last-read id on transient validation failures', async () => {
		localStorage.setItem(
			'novellum:reader',
			JSON.stringify({ mode: 'classic', lastBookId: 'book-transient', pageIndex: {} }),
		);
		apiGet.mockRejectedValue(new Error('network down'));

		const { resolveLastReadBookId } = await loadNavigationState();
		const resolved = await resolveLastReadBookId();

		expect(resolved).toEqual({ id: 'book-transient', status: 'error' });
		expect(setPreference).not.toHaveBeenCalled();
		expect(localStorage.getItem('novellum:reader')).toContain('book-transient');
	});

	it('derives editor context from the visible project route and query params', async () => {
		const { deriveRouteContext } = await loadNavigationState();
		const resolved = deriveRouteContext({
			pathname: '/projects/proj-1/editor',
			searchParams: '?chapterId=chapter-2&sceneId=scene-9',
			params: { id: 'stale-param' },
		});

		expect(resolved).toMatchObject({
			workspace: 'editor',
			projectId: 'proj-1',
			activeChapterId: 'chapter-2',
			activeSceneId: 'scene-9',
			isProjectScoped: true,
			novaSurface: 'embedded-project',
		});
	});

	it('derives worldbuilding sub-route context without a scene or chapter', async () => {
		const { deriveRouteContext } = await loadNavigationState();
		const resolved = deriveRouteContext({
			pathname: '/projects/proj-1/world-building/locations/realms',
		});

		expect(resolved).toMatchObject({
			workspace: 'world-building',
			projectId: 'proj-1',
			worldbuildingPath: 'locations/realms',
			activeChapterId: null,
			activeSceneId: null,
			novaSurface: 'embedded-project',
		});
	});

	it('keeps fullscreen Nova as global exploratory context', async () => {
		const { deriveRouteContext } = await loadNavigationState();
		const resolved = deriveRouteContext({ pathname: '/nova' });

		expect(resolved).toMatchObject({
			workspace: 'nova',
			projectId: null,
			isProjectScoped: false,
			novaSurface: 'global-exploratory',
		});
	});

	it('ignores placeholder ids when deriving project context', async () => {
		const { deriveRouteContext } = await loadNavigationState();
		const resolved = deriveRouteContext({
			pathname: '/projects/undefined/editor/scene-1',
			params: { id: 'undefined', sceneId: 'scene-1' },
		});

		expect(resolved.projectId).toBeNull();
		expect(resolved.activeSceneId).toBe('scene-1');
	});
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '../../src/lib/db/index.js';
import {
	createScene,
	getSceneById,
	getScenesByProjectId,
	updateScene,
	removeScene,
} from '../../src/modules/editor/services/scene-repository.js';

const projectId = crypto.randomUUID();
const chapterId = crypto.randomUUID();

const baseScene = {
	chapterId,
	projectId,
	title: 'Opening',
	summary: 'The start',
	content: 'It began in darkness.',
	wordCount: 4,
	order: 1,
	povCharacterId: null,
	locationId: null,
	timelineEventId: null,
	characterIds: [] as string[],
	locationIds: [] as string[],
};

beforeEach(async () => {
	await db.scenes.clear();
});

describe('scene-repository', () => {
	it('creates a scene with auto-generated id and timestamps', async () => {
		const s = await createScene(baseScene);
		expect(s.id).toBeDefined();
		expect(s.title).toBe('Opening');
		expect(s.createdAt).toBeDefined();
		expect(s.updatedAt).toBeDefined();
	});

	it('retrieves a scene by id', async () => {
		const created = await createScene(baseScene);
		const found = await getSceneById(created.id);
		expect(found).toBeDefined();
		expect(found!.id).toBe(created.id);
	});

	it('returns undefined for a nonexistent id', async () => {
		const found = await getSceneById('nonexistent-scene-id');
		expect(found).toBeUndefined();
	});

	it('returns scenes by projectId', async () => {
		await createScene({ ...baseScene, title: 'Scene 1', order: 1 });
		await createScene({ ...baseScene, title: 'Scene 2', order: 2 });
		const scenes = await getScenesByProjectId(projectId);
		expect(scenes.length).toBeGreaterThanOrEqual(2);
		expect(scenes.every((s) => s.projectId === projectId)).toBe(true);
	});

	it('does not return scenes from a different project', async () => {
		const otherId = crypto.randomUUID();
		await createScene({ ...baseScene, projectId: otherId, title: 'Other' });
		const scenes = await getScenesByProjectId(projectId);
		expect(scenes.every((s) => s.projectId === projectId)).toBe(true);
	});

	it('updates a scene field', async () => {
		const s = await createScene(baseScene);
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date(Date.now() + 1000));
		await updateScene(s.id, { title: 'Updated Title' });
		vi.useRealTimers();
		const updated = await getSceneById(s.id);
		expect(updated!.title).toBe('Updated Title');
		expect(updated!.updatedAt).not.toBe(s.updatedAt);
	});

	it('removes a scene', async () => {
		const s = await createScene(baseScene);
		await removeScene(s.id);
		const found = await getSceneById(s.id);
		expect(found).toBeUndefined();
	});
});

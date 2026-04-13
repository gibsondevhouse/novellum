import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '../../src/lib/db/index.js';
import {
	createBeat,
	getBeatById,
	getBeatsBySceneId,
	updateBeat,
	removeBeat,
} from '../../src/modules/editor/services/beat-repository.js';

const projectId = crypto.randomUUID();
const sceneId = crypto.randomUUID();

const baseBeat = {
	sceneId,
	projectId,
	title: 'Inciting Incident',
	type: 'action',
	order: 1,
	notes: 'Hero discovers the letter.',
};

beforeEach(async () => {
	await db.beats.clear();
});

describe('beat-repository', () => {
	it('creates a beat with auto-generated id and timestamps', async () => {
		const b = await createBeat(baseBeat);
		expect(b.id).toBeDefined();
		expect(b.title).toBe('Inciting Incident');
		expect(b.createdAt).toBeDefined();
		expect(b.updatedAt).toBeDefined();
	});

	it('retrieves a beat by id', async () => {
		const created = await createBeat(baseBeat);
		const found = await getBeatById(created.id);
		expect(found).toBeDefined();
		expect(found!.id).toBe(created.id);
	});

	it('returns undefined for a nonexistent id', async () => {
		const found = await getBeatById('nonexistent-beat-id');
		expect(found).toBeUndefined();
	});

	it('returns beats by sceneId', async () => {
		await createBeat({ ...baseBeat, title: 'Beat 1', order: 1 });
		await createBeat({ ...baseBeat, title: 'Beat 2', order: 2 });
		const beats = await getBeatsBySceneId(sceneId);
		expect(beats.length).toBeGreaterThanOrEqual(2);
		expect(beats.every((b) => b.sceneId === sceneId)).toBe(true);
	});

	it('does not return beats from a different scene', async () => {
		const otherId = crypto.randomUUID();
		await createBeat({ ...baseBeat, sceneId: otherId, title: 'Other Beat' });
		const beats = await getBeatsBySceneId(sceneId);
		expect(beats.every((b) => b.sceneId === sceneId)).toBe(true);
	});

	it('updates a beat field', async () => {
		const b = await createBeat(baseBeat);
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date(Date.now() + 1000));
		await updateBeat(b.id, { title: 'Updated Beat' });
		vi.useRealTimers();
		const updated = await getBeatById(b.id);
		expect(updated!.title).toBe('Updated Beat');
		expect(updated!.updatedAt).not.toBe(b.updatedAt);
	});

	it('removes a beat', async () => {
		const b = await createBeat(baseBeat);
		await removeBeat(b.id);
		const found = await getBeatById(b.id);
		expect(found).toBeUndefined();
	});
});

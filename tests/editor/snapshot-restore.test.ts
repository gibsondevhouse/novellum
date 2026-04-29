/**
 * plan-017 stage-007 phase-002 — snapshot restore endpoint.
 *
 * Pins the contract: restore captures a `pre-restore` snapshot first,
 * 404s on unknown snapshots, and the autosave POST endpoint suppresses
 * exact-duplicate snapshots while still respecting the newest-first
 * ordering on GET.
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/server/db/index.js', async () => {
	const actual = await vi.importActual<typeof import('$lib/server/db/index.js')>(
		'$lib/server/db/index.js',
	);
	const { default: Database } = await import('better-sqlite3');
	const memDb = new Database(':memory:');
	actual.runMigrations(memDb, actual.MIGRATION_REGISTRY);

	const now = '2026-04-29T00:00:00.000Z';
	memDb
		.prepare(
			"INSERT INTO projects (id, title, projectType, createdAt, updatedAt) VALUES ('p1', 'Test', 'novel', ?, ?)",
		)
		.run(now, now);
	memDb
		.prepare(
			`INSERT INTO scenes (id, chapterId, projectId, title, "order", content, createdAt, updatedAt)
			 VALUES ('scene-1', 'chap-1', 'p1', 'Scene 1', 0, 'CURRENT TEXT', ?, ?)`,
		)
		.run(now, now);

	return { ...actual, db: memDb };
});

async function loadPost() {
	const mod = await import('../../src/routes/api/db/scene_snapshots/+server.js');
	return mod.POST;
}
async function loadGet() {
	const mod = await import('../../src/routes/api/db/scene_snapshots/+server.js');
	return mod.GET;
}
async function loadRestore() {
	const mod = await import('../../src/routes/api/db/scene_snapshots/[id]/restore/+server.js');
	return mod.POST;
}

function makeRequest(body: unknown): Parameters<Awaited<ReturnType<typeof loadPost>>>[0] {
	return {
		request: new Request('http://test', {
			method: 'POST',
			body: JSON.stringify(body),
			headers: { 'content-type': 'application/json' },
		}),
	} as unknown as Parameters<Awaited<ReturnType<typeof loadPost>>>[0];
}

describe('snapshot endpoints', () => {
	it('persists snapshot metadata on POST', async () => {
		const POST = await loadPost();
		const res = await POST(
			makeRequest({
				sceneId: 'scene-1',
				projectId: 'p1',
				text: 'first version of the scene',
				wordCount: 5,
				source: 'autosave',
				label: '',
				reason: '',
			}),
		);
		expect(res.status).toBe(201);
		const body = await res.json();
		expect(body.source).toBe('autosave');
		expect(body.wordCount).toBe(5);
	});

	it('suppresses near-duplicate consecutive autosave snapshots', async () => {
		const POST = await loadPost();
		const text = 'identical text';
		await POST(makeRequest({ sceneId: 'scene-1', projectId: 'p1', text, source: 'autosave' }));
		const second = await POST(
			makeRequest({ sceneId: 'scene-1', projectId: 'p1', text, source: 'autosave' }),
		);
		expect(second.status).toBe(200);
		const body = await second.json();
		expect(body.skipped).toBe(true);
	});

	it('still inserts non-autosave snapshots even when text matches', async () => {
		const POST = await loadPost();
		const text = 'manual snapshot text';
		await POST(makeRequest({ sceneId: 'scene-1', projectId: 'p1', text, source: 'manual' }));
		const second = await POST(
			makeRequest({ sceneId: 'scene-1', projectId: 'p1', text, source: 'manual' }),
		);
		expect(second.status).toBe(201);
	});

	it('lists snapshots newest-first', async () => {
		const POST = await loadPost();
		await POST(makeRequest({ sceneId: 'scene-1', projectId: 'p1', text: 'a' }));
		await POST(makeRequest({ sceneId: 'scene-1', projectId: 'p1', text: 'b' }));
		const GET = await loadGet();
		const res = await GET({
			url: new URL('http://test/?sceneId=scene-1'),
		} as unknown as Parameters<Awaited<ReturnType<typeof loadGet>>>[0]);
		const list = (await res.json()) as Array<{ createdAt: string }>;
		const sorted = [...list].sort((x, y) => y.createdAt.localeCompare(x.createdAt));
		expect(list.map((r) => r.createdAt)).toEqual(sorted.map((r) => r.createdAt));
	});

	it('restore captures a pre-restore snapshot before returning the target text', async () => {
		const POST = await loadPost();
		const created = await POST(
			makeRequest({
				sceneId: 'scene-1',
				projectId: 'p1',
				text: 'TARGET TEXT',
				source: 'manual',
			}),
		);
		const target = await created.json();

		const Restore = await loadRestore();
		const res = await Restore({ params: { id: target.id } } as unknown as Parameters<
			Awaited<ReturnType<typeof loadRestore>>
		>[0]);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.restoredText).toBe('TARGET TEXT');
		expect(typeof body.preRestoreSnapshotId).toBe('string');

		// The pre-restore snapshot should hold the current scene content
		// and reference the target snapshot id in `reason`.
		const GET = await loadGet();
		const listRes = await GET({
			url: new URL('http://test/?sceneId=scene-1'),
		} as unknown as Parameters<Awaited<ReturnType<typeof loadGet>>>[0]);
		const list = (await listRes.json()) as Array<{
			id: string;
			source: string;
			text: string;
			reason: string;
		}>;
		const pre = list.find((r) => r.id === body.preRestoreSnapshotId);
		expect(pre).toBeDefined();
		expect(pre?.source).toBe('pre-restore');
		expect(pre?.text).toBe('CURRENT TEXT');
		expect(pre?.reason).toBe(`restore_target=${target.id}`);
	});

	it('restore returns 404 when the snapshot id is unknown', async () => {
		const Restore = await loadRestore();
		const res = await Restore({
			params: { id: '00000000-0000-0000-0000-000000000000' },
		} as unknown as Parameters<Awaited<ReturnType<typeof loadRestore>>>[0]);
		expect(res.status).toBe(404);
	});
});

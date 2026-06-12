import { test, expect, type APIRequestContext } from '@playwright/test';
import Database from 'better-sqlite3';
import { createHash, randomUUID } from 'node:crypto';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';

/**
 * End-to-end coverage for the current author-draft review-gate flow.
 *
 * Agent mode may create review artifacts, but manuscript mutation happens
 * through the trusted author-draft accept route. This spec seeds canonical
 * review checkpoints, then verifies explicit accept applies prose while
 * explicit reject leaves the target scene untouched.
 *
 * Prerequisites:
 *   - Preview server running at http://localhost:4173 (Playwright launches it).
 */

const AUTHOR_DRAFT_OWNER_ID = 'authorDraftCheckpoints.v1';
const AUTHOR_DRAFT_TASK_KEY = 'vibe-author.scene-draft';
const AUTHOR_DRAFT_ARTIFACT_TYPE = 'vibe-author.scene-draft';
const AUTHOR_DRAFT_ARTIFACT_VERSION = 1;

function resolvePreviewDatabasePath(): string {
	if (process.env.NOVELLUM_DB_PATH) return process.env.NOVELLUM_DB_PATH;
	if (process.env.NOVELLUM_APP_DATA_DIR) {
		return join(process.env.NOVELLUM_APP_DATA_DIR, 'novellum.db');
	}
	const home = homedir();
	if (platform() === 'darwin') {
		return join(home, 'Library', 'Application Support', 'Novellum', 'novellum.db');
	}
	if (platform() === 'win32') {
		return join(process.env.APPDATA ?? join(home, 'AppData', 'Roaming'), 'Novellum', 'novellum.db');
	}
	return join(process.env.XDG_DATA_HOME ?? join(home, '.local', 'share'), 'Novellum', 'novellum.db');
}

async function createProject(request: APIRequestContext, title: string): Promise<string> {
	const response = await request.post('/api/db/projects', { data: { title } });
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

async function deleteProject(request: APIRequestContext, projectId: string): Promise<void> {
	const response = await request.delete(`/api/db/projects/${projectId}`);
	expect(response.ok()).toBe(true);
}

async function createChapter(request: APIRequestContext, projectId: string, title: string): Promise<string> {
	const response = await request.post('/api/db/chapters', {
		data: { projectId, title, order: 0 },
	});
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

async function createScene(
	request: APIRequestContext,
	projectId: string,
	chapterId: string,
	title: string,
	content = '',
): Promise<string> {
	const response = await request.post('/api/db/scenes', {
		data: { projectId, chapterId, title, order: 0, content },
	});
	expect(response.ok()).toBe(true);
	const payload = (await response.json()) as { id: string };
	return payload.id;
}

interface SceneRecord {
	id: string;
	content: string;
}

interface AuthorDraftCheckpointEnvelope {
	checkpoint: {
		id: string;
		sceneId: string;
		lifecycle: 'review' | 'accepted' | 'rejected';
	};
}

function sha256Hex(value: string): string {
	return createHash('sha256').update(value, 'utf8').digest('hex');
}

function wordCount(text: string): number {
	const trimmed = text.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).filter(Boolean).length;
}

function seedAuthorDraftCheckpoint(input: {
	projectId: string;
	sceneId: string;
	prose: string;
}): { id: string; lifecycle: 'review' } {
	const database = new Database(resolvePreviewDatabasePath(), { timeout: 5000 });
	try {
		database.pragma('foreign_keys = ON');
		const scene = database
			.prepare('SELECT id, projectId, chapterId, title, content, updatedAt FROM scenes WHERE id = ?')
			.get(input.sceneId) as
			| {
					id: string;
					projectId: string;
					chapterId: string;
					title: string;
					content: string;
					updatedAt: string;
			  }
			| undefined;

		if (!scene) {
			throw new Error(`Scene ${input.sceneId} was not found for author-draft checkpoint seed.`);
		}
		expect(scene.projectId).toBe(input.projectId);

		const now = new Date().toISOString();
		const checkpointId = randomUUID();
		const count = wordCount(input.prose);
		const record = {
			id: checkpointId,
			projectId: input.projectId,
			taskKey: AUTHOR_DRAFT_TASK_KEY,
			sceneId: input.sceneId,
			chapterId: scene.chapterId,
			artifactEnvelope: {
				type: AUTHOR_DRAFT_ARTIFACT_TYPE,
				version: AUTHOR_DRAFT_ARTIFACT_VERSION,
				projectId: input.projectId,
				chapterId: scene.chapterId,
				sceneId: input.sceneId,
				title: scene.title,
				prose: input.prose,
				wordCount: count,
				sidecar: {
					sceneId: input.sceneId,
					chapterId: scene.chapterId,
					povCharacterId: null,
					wordCount: count,
					usedCanonRefs: [],
					uncertainties: [],
					continuityRisks: [],
				},
			},
			lifecycle: 'review',
			createdAt: now,
			updatedAt: now,
			baseSceneUpdatedAt: scene.updatedAt,
			baseSceneContentHash: sha256Hex(scene.content ?? ''),
		};

		database
			.prepare(
				`INSERT INTO project_metadata (projectId, scope, ownerId, key, value, updatedAt)
				 VALUES (@projectId, 'pipeline', @ownerId, @key, @value, @updatedAt)`,
			)
			.run({
				projectId: input.projectId,
				ownerId: AUTHOR_DRAFT_OWNER_ID,
				key: checkpointId,
				value: JSON.stringify(record),
				updatedAt: now,
			});
		return { id: checkpointId, lifecycle: 'review' };
	} finally {
		database.close();
	}
}

async function acceptCheckpoint(
	request: APIRequestContext,
	projectId: string,
	sceneId: string,
	checkpointId: string,
): Promise<AuthorDraftCheckpointEnvelope> {
	const response = await request.post(`/api/author-draft/checkpoints/${checkpointId}/accept`, {
		data: { projectId, sceneId },
	});
	expect(response.ok(), `accept checkpoint failed: ${response.status()}`).toBe(true);
	return (await response.json()) as AuthorDraftCheckpointEnvelope;
}

async function rejectCheckpoint(
	request: APIRequestContext,
	projectId: string,
	checkpointId: string,
	reason: string,
): Promise<AuthorDraftCheckpointEnvelope> {
	const response = await request.post(`/api/author-draft/checkpoints/${checkpointId}/reject`, {
		data: { projectId, reason },
	});
	expect(response.ok(), `reject checkpoint failed: ${response.status()}`).toBe(true);
	return (await response.json()) as AuthorDraftCheckpointEnvelope;
}

async function fetchScene(request: APIRequestContext, projectId: string, sceneId: string): Promise<SceneRecord> {
	const response = await request.get(`/api/db/scenes?projectId=${projectId}`);
	expect(response.ok()).toBe(true);
	const scenes = (await response.json()) as SceneRecord[];
	const scene = scenes.find((row) => row.id === sceneId);
	expect(scene).toBeDefined();
	return scene as SceneRecord;
}

test.describe('vibe-author review-gate flow', () => {
	test('generates, explicitly accepts, and rejects scene-draft checkpoints through trusted routes', async ({
		request,
	}) => {
		const projectId = await createProject(request, `E2E Author Review ${Date.now()}`);
		try {
			const chapterId = await createChapter(request, projectId, 'Chapter One');
			const acceptSceneId = await createScene(request, projectId, chapterId, 'Accept Scene');
			const rejectSceneId = await createScene(request, projectId, chapterId, 'Reject Scene');

			const draft = seedAuthorDraftCheckpoint({
				projectId,
				sceneId: acceptSceneId,
				prose: `Drafted prose for accepted scene ${acceptSceneId}.`,
			});
			expect(draft.lifecycle).toBe('review');
			expect(await fetchScene(request, projectId, acceptSceneId)).toMatchObject({ content: '' });

			const acceptedScene = await acceptCheckpoint(
				request,
				projectId,
				acceptSceneId,
				draft.id,
			);
			expect(acceptedScene.checkpoint.lifecycle).toBe('accepted');
			const acceptedTarget = await fetchScene(request, projectId, acceptSceneId);
			expect(acceptedTarget.content).toContain(`Drafted prose for accepted scene ${acceptSceneId}.`);

			const rejectDraft = seedAuthorDraftCheckpoint({
				projectId,
				sceneId: rejectSceneId,
				prose: `Drafted prose for rejected scene ${rejectSceneId}.`,
			});
			expect(rejectDraft.lifecycle).toBe('review');
			const rejectedSceneBefore = await fetchScene(request, projectId, rejectSceneId);

			const rejectedRevision = await rejectCheckpoint(
				request,
				projectId,
				rejectDraft.id,
				'Scene draft needs another pass.',
			);
			expect(rejectedRevision.checkpoint.lifecycle).toBe('rejected');
			expect(await fetchScene(request, projectId, rejectSceneId)).toMatchObject({
				content: rejectedSceneBefore.content,
			});
		} finally {
			await deleteProject(request, projectId);
		}
	});
});

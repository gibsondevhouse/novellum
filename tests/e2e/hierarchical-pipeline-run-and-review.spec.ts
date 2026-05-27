import { test, expect, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';

/**
 * End-to-end coverage for plan-028 worldbuild checkpoint run and review flow.
 *
 * Exercises the pipeline metadata REST surface to verify draft → review →
 * accept lifecycle with queue visibility and canon safety.
 */

const OWNER_ID = 'vibe-worldbuild';

async function createProject(request: APIRequestContext, title: string): Promise<string> {
	const response = await request.post('/api/db/projects', { data: { title } });
	expect(response.ok()).toBe(true);
	return ((await response.json()) as { id: string }).id;
}

async function deleteProject(request: APIRequestContext, projectId: string): Promise<void> {
	const response = await request.delete(`/api/db/projects/${projectId}`);
	expect(response.ok()).toBe(true);
}

interface CheckpointResult {
	ok: boolean;
	checkpoint: {
		id: string;
		lifecycle: string;
		review: { reviewer?: string; note?: string } | null;
		acceptance: { acceptedBy?: string } | null;
	};
}

async function putCheckpoint(
	request: APIRequestContext,
	projectId: string,
	checkpointId: string,
	body: Record<string, unknown>,
): Promise<CheckpointResult> {
	const url = `/api/db/project-metadata/${projectId}/pipeline/${OWNER_ID}/${checkpointId}`;
	const response = await request.put(url, { data: body });
	expect(response.ok(), `PUT ${url} failed: ${response.status()}`).toBe(true);
	return (await response.json()) as CheckpointResult;
}

async function listCheckpoints(
	request: APIRequestContext,
	projectId: string,
): Promise<Record<string, unknown>> {
	const url = `/api/db/project-metadata/${projectId}/pipeline/${OWNER_ID}`;
	const response = await request.get(url);
	expect(response.ok()).toBe(true);
	const body = (await response.json()) as { data: Record<string, unknown> };
	return body.data ?? {};
}

function buildMinimalArtifact(taskKey: string) {
	return {
		id: randomUUID(),
		taskKey,
		family: 'vibe-worldbuild',
		stage: 'premise',
		parserVersion: '1.0.0',
		producedAt: new Date().toISOString(),
		lifecycle: 'draft',
		payload: { premise: 'A test premise.' },
	};
}

test.describe('plan-028 worldbuild run and review flow', () => {
	test('draft → review → accept lifecycle produces visible queue entries', async ({ request }) => {
		const projectId = await createProject(request, `E2E Run Review ${Date.now()}`);
		try {
			const artifact = buildMinimalArtifact('vibe-worldbuild.premise');
			const checkpointId = artifact.id;

			const draft = await putCheckpoint(request, projectId, checkpointId, {
				operation: 'upsert',
				value: { artifact, version: '1.0.0' },
			});
			expect(draft.checkpoint.lifecycle).toBe('draft');

			const entries = await listCheckpoints(request, projectId);
			expect(Object.keys(entries).length).toBeGreaterThanOrEqual(1);

			const reviewed = await putCheckpoint(request, projectId, checkpointId, {
				operation: 'review',
				reviewer: 'e2e-agent',
				note: 'LGTM',
			});
			expect(reviewed.checkpoint.lifecycle).toBe('review');
			expect(reviewed.checkpoint.review?.reviewer).toBe('e2e-agent');

			const accepted = await putCheckpoint(request, projectId, checkpointId, {
				operation: 'accept',
				acceptedBy: 'e2e-agent',
			});
			expect(accepted.checkpoint.lifecycle).toBe('accepted');
			expect(accepted.checkpoint.acceptance?.acceptedBy).toBe('e2e-agent');

		} finally {
			await deleteProject(request, projectId);
		}
	});

	test('multiple checkpoints appear in queue with distinct lifecycles', async ({ request }) => {
		const projectId = await createProject(request, `E2E Multi Queue ${Date.now()}`);
		try {
			const a1 = buildMinimalArtifact('vibe-worldbuild.premise');
			const a2 = buildMinimalArtifact('vibe-worldbuild.worldspec');

			await putCheckpoint(request, projectId, a1.id, {
				operation: 'upsert',
				value: { artifact: a1, version: '1.0.0' },
			});
			await putCheckpoint(request, projectId, a2.id, {
				operation: 'upsert',
				value: { artifact: a2, version: '1.0.0' },
			});

			await putCheckpoint(request, projectId, a1.id, {
				operation: 'review',
			});

			const entries = await listCheckpoints(request, projectId);
			const values = Object.values(entries) as Array<{ lifecycle: string }>;
			const lifecycles = values.map((v) => v.lifecycle);

			expect(lifecycles).toContain('review');
			expect(lifecycles).toContain('draft');

		} finally {
			await deleteProject(request, projectId);
		}
	});
});

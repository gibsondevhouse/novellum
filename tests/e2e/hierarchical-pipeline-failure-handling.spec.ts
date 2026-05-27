import { test, expect, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';

/**
 * End-to-end coverage for plan-028 checkpoint failure and edge-case handling.
 *
 * Verifies invalid transitions, reject-without-reason validation,
 * and no-canon-mutation guarantees on terminal lifecycle states.
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

async function putCheckpoint(
	request: APIRequestContext,
	projectId: string,
	checkpointId: string,
	body: Record<string, unknown>,
): Promise<{ status: number; payload: Record<string, unknown> }> {
	const url = `/api/db/project-metadata/${projectId}/pipeline/${OWNER_ID}/${checkpointId}`;
	const response = await request.put(url, { data: body });
	return {
		status: response.status(),
		payload: (await response.json()) as Record<string, unknown>,
	};
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
		payload: { premise: 'Failure test premise.' },
	};
}

test.describe('plan-028 checkpoint failure handling', () => {
	test('reject requires a reason — server rejects empty reason', async ({ request }) => {
		const projectId = await createProject(request, `E2E Reject Validation ${Date.now()}`);
		try {
			const artifact = buildMinimalArtifact('vibe-worldbuild.premise');

			const draft = await putCheckpoint(request, projectId, artifact.id, {
				operation: 'upsert',
				value: { artifact, version: '1.0.0' },
			});
			expect(draft.status).toBe(200);

			const rejectNoReason = await putCheckpoint(request, projectId, artifact.id, {
				operation: 'reject',
				reason: '',
			});
			expect(rejectNoReason.status).toBe(400);

		} finally {
			await deleteProject(request, projectId);
		}
	});

	test('accept-after-reject returns 409 invalid_transition', async ({ request }) => {
		const projectId = await createProject(request, `E2E Invalid Transition ${Date.now()}`);
		try {
			const artifact = buildMinimalArtifact('vibe-worldbuild.premise');

			await putCheckpoint(request, projectId, artifact.id, {
				operation: 'upsert',
				value: { artifact, version: '1.0.0' },
			});

			const rejected = await putCheckpoint(request, projectId, artifact.id, {
				operation: 'reject',
				rejectedBy: 'e2e-agent',
				reason: 'Scope mismatch.',
			});
			expect(rejected.status).toBe(200);
			expect((rejected.payload as { checkpoint: { lifecycle: string } }).checkpoint.lifecycle).toBe('rejected');

			const conflict = await putCheckpoint(request, projectId, artifact.id, {
				operation: 'accept',
			});
			expect(conflict.status).toBe(409);
			expect((conflict.payload as { code: string }).code).toBe('invalid_transition');

		} finally {
			await deleteProject(request, projectId);
		}
	});

	test('no canon writes occur when checkpoint stays in draft', async ({ request }) => {
		const projectId = await createProject(request, `E2E No Canon Draft ${Date.now()}`);
		try {
			const artifact = buildMinimalArtifact('vibe-worldbuild.premise');

			await putCheckpoint(request, projectId, artifact.id, {
				operation: 'upsert',
				value: { artifact, version: '1.0.0' },
			});

			const characters = await request.get(`/api/db/characters?projectId=${projectId}`);
			expect(characters.ok()).toBe(true);
			const characterList = (await characters.json()) as unknown[];
			expect(characterList).toEqual([]);

		} finally {
			await deleteProject(request, projectId);
		}
	});
});

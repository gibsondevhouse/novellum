import { beforeEach, describe, expect, it, vi } from 'vitest';

const listProjectMetadataMock = vi.fn();
const getProjectMetadataMock = vi.fn();
const setProjectMetadataMock = vi.fn();
const deleteProjectMetadataMock = vi.fn();

const upsertWorldbuildCheckpointMock = vi.fn();
const reviewWorldbuildCheckpointMock = vi.fn();
const acceptWorldbuildCheckpointMock = vi.fn();
const rejectWorldbuildCheckpointMock = vi.fn();

const checkpointMockState = vi.hoisted(() => {
	class MockWorldbuildCheckpointError extends Error {
		readonly code: string;

		constructor(code: string, message: string) {
			super(message);
			this.code = code;
		}
	}

	return { MockWorldbuildCheckpointError };
});

vi.mock('$lib/server/project-metadata/project-metadata-service.js', () => ({
	listProjectMetadata: (...args: unknown[]) => listProjectMetadataMock(...args),
	getProjectMetadata: (...args: unknown[]) => getProjectMetadataMock(...args),
	setProjectMetadata: (...args: unknown[]) => setProjectMetadataMock(...args),
	deleteProjectMetadata: (...args: unknown[]) => deleteProjectMetadataMock(...args),
}));

vi.mock('$lib/ai/pipeline/checkpoint-service.js', () => ({
	upsertWorldbuildCheckpoint: (...args: unknown[]) => upsertWorldbuildCheckpointMock(...args),
	reviewWorldbuildCheckpoint: (...args: unknown[]) => reviewWorldbuildCheckpointMock(...args),
	acceptWorldbuildCheckpoint: (...args: unknown[]) => acceptWorldbuildCheckpointMock(...args),
	rejectWorldbuildCheckpoint: (...args: unknown[]) => rejectWorldbuildCheckpointMock(...args),
	WorldbuildCheckpointError: checkpointMockState.MockWorldbuildCheckpointError,
}));

import { GET as listMetadata } from '../../src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/+server.js';
import {
	GET as getMetadata,
	PUT as putMetadata,
	DELETE as deleteMetadata,
} from '../../src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.js';

describe('project metadata pipeline scope routes', () => {
	beforeEach(() => {
		listProjectMetadataMock.mockReset();
		getProjectMetadataMock.mockReset();
		setProjectMetadataMock.mockReset();
		deleteProjectMetadataMock.mockReset();
		upsertWorldbuildCheckpointMock.mockReset();
		reviewWorldbuildCheckpointMock.mockReset();
		acceptWorldbuildCheckpointMock.mockReset();
		rejectWorldbuildCheckpointMock.mockReset();
	});

	it('allows listing metadata for pipeline scope', async () => {
		listProjectMetadataMock.mockReturnValueOnce({
			'artifact-1': { id: 'artifact-1', lifecycle: 'draft' },
		});

		const response = await listMetadata({
			params: {
				projectId: 'proj-1',
				scope: 'pipeline',
				ownerId: 'vibe-worldbuild',
			},
		} as Parameters<typeof listMetadata>[0]);

		expect(response.status).toBe(200);
		const body = (await response.json()) as { data: Record<string, unknown> };
		expect(body.data['artifact-1']).toMatchObject({ id: 'artifact-1' });
		expect(listProjectMetadataMock).toHaveBeenCalledWith('proj-1', 'pipeline', 'vibe-worldbuild');
	});

	it('routes pipeline upsert operations through checkpoint service', async () => {
		upsertWorldbuildCheckpointMock.mockReturnValueOnce({ id: 'artifact-1', lifecycle: 'draft' });

		const response = await putMetadata({
			params: {
				projectId: 'proj-1',
				scope: 'pipeline',
				ownerId: 'vibe-worldbuild',
				key: 'artifact-1',
			},
			request: new Request('http://localhost/api/db/project-metadata/proj-1/pipeline/vibe-worldbuild/artifact-1', {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					operation: 'upsert',
					value: { artifact: { id: 'artifact-1', taskKey: 'vibe-worldbuild.premise' } },
				}),
			}),
		} as Parameters<typeof putMetadata>[0]);

		expect(response.status).toBe(200);
		const body = (await response.json()) as { checkpoint: { id: string } };
		expect(body.checkpoint.id).toBe('artifact-1');
		expect(upsertWorldbuildCheckpointMock).toHaveBeenCalledWith(
			'proj-1',
			'vibe-worldbuild',
			'artifact-1',
			expect.any(Object),
		);
		expect(setProjectMetadataMock).not.toHaveBeenCalled();
	});

	it('maps checkpoint transition errors to route responses', async () => {
		acceptWorldbuildCheckpointMock.mockImplementationOnce(() => {
			throw new checkpointMockState.MockWorldbuildCheckpointError(
				'invalid_transition',
				'already accepted',
			);
		});

		const response = await putMetadata({
			params: {
				projectId: 'proj-1',
				scope: 'pipeline',
				ownerId: 'vibe-worldbuild',
				key: 'artifact-1',
			},
			request: new Request('http://localhost/api/db/project-metadata/proj-1/pipeline/vibe-worldbuild/artifact-1', {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ operation: 'accept' }),
			}),
		} as Parameters<typeof putMetadata>[0]);

		expect(response.status).toBe(409);
		const body = (await response.json()) as { code: string };
		expect(body.code).toBe('invalid_transition');
	});

	it('preserves existing non-pipeline metadata semantics', async () => {
		setProjectMetadataMock.mockReturnValueOnce(undefined);
		getProjectMetadataMock.mockReturnValueOnce({ enabled: true });

		const putResponse = await putMetadata({
			params: {
				projectId: 'proj-1',
				scope: 'scene',
				ownerId: 'scene-1',
				key: 'clarity',
			},
			request: new Request('http://localhost/api/db/project-metadata/proj-1/scene/scene-1/clarity', {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ value: { enabled: true } }),
			}),
		} as Parameters<typeof putMetadata>[0]);
		expect(putResponse.status).toBe(200);
		expect(setProjectMetadataMock).toHaveBeenCalledWith(
			'proj-1',
			'scene',
			'scene-1',
			'clarity',
			{ enabled: true },
		);

		const getResponse = await getMetadata({
			params: {
				projectId: 'proj-1',
				scope: 'scene',
				ownerId: 'scene-1',
				key: 'clarity',
			},
		} as Parameters<typeof getMetadata>[0]);
		expect(getResponse.status).toBe(200);
		expect((await getResponse.json()) as { value: unknown }).toEqual({ value: { enabled: true } });

		const deleteResponse = await deleteMetadata({
			params: {
				projectId: 'proj-1',
				scope: 'scene',
				ownerId: 'scene-1',
				key: 'clarity',
			},
		} as Parameters<typeof deleteMetadata>[0]);
		expect(deleteResponse.status).toBe(200);
		expect(deleteProjectMetadataMock).toHaveBeenCalledWith('proj-1', 'scene', 'scene-1', 'clarity');
	});
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	acceptProposal,
	rejectProposal,
} from '../../src/modules/world-building/services/worldbuilding-proposal-service.js';

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

function lastJsonBody(fetchMock: ReturnType<typeof vi.fn>): Record<string, unknown> {
	const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
	return JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
}

describe('worldbuilding proposal service', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('includes projectId when accepting a proposal', async () => {
		const fetchMock = vi.fn(async () => jsonResponse({ ok: true }));
		vi.stubGlobal('fetch', fetchMock);

		await expect(acceptProposal('project-1', 'proposal-1')).resolves.toEqual({ ok: true });

		expect(fetchMock).toHaveBeenCalledWith('/api/worldbuilding/proposals/proposal-1/accept', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ projectId: 'project-1' }),
		});
	});

	it('includes projectId and reason when rejecting a proposal', async () => {
		const fetchMock = vi.fn(async () => jsonResponse({ ok: true }));
		vi.stubGlobal('fetch', fetchMock);

		await expect(rejectProposal('project-1', 'proposal-1', 'Conflicts with canon.')).resolves.toEqual({
			ok: true,
		});

		expect(fetchMock).toHaveBeenCalledWith('/api/worldbuilding/proposals/proposal-1/reject', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				projectId: 'project-1',
				reason: 'Conflicts with canon.',
			}),
		});
		expect(lastJsonBody(fetchMock)).toEqual({
			projectId: 'project-1',
			reason: 'Conflicts with canon.',
		});
	});
});

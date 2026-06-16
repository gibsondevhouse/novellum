import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	canGenerateDomain,
	getGenerationEntityKindForDomain,
	runWorldbuildingDomainGeneration,
} from '../../src/modules/world-building/services/worldbuilding-generation-actions.js';
import {
	getMissingContextReason,
	getState,
	resetState,
	transition,
} from '../../src/modules/world-building/stores/worldbuilding-generation-state.svelte.js';
import {
	getDrafts,
	getPhase,
	resetGeneration,
} from '../../src/modules/world-building/stores/generation-draft.svelte.js';
import type { WorldbuildingDomainId } from '../../src/modules/world-building/worldbuilding-workflow.js';

const ALL_DOMAINS: WorldbuildingDomainId[] = ['personae', 'atlas', 'archive', 'threads', 'chronicles'];

function allCounts(value: number): Record<WorldbuildingDomainId, number> {
	return { personae: value, atlas: value, archive: value, threads: value, chronicles: value };
}

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

beforeEach(() => {
	for (const domain of ALL_DOMAINS) resetState(domain);
	resetGeneration();
});

afterEach(() => {
	vi.unstubAllGlobals();
	resetGeneration();
});

describe('worldbuilding generation domain actions', () => {
	it('keeps a conservative domain to entity-kind mapping', () => {
		expect(getGenerationEntityKindForDomain('personae')).toBe('character');
		expect(getGenerationEntityKindForDomain('atlas')).toBe('realm');
		expect(getGenerationEntityKindForDomain('archive')).toBe('lore-entry');
		expect(getGenerationEntityKindForDomain('threads')).toBe('plot-thread');
		expect(getGenerationEntityKindForDomain('chronicles')).toBe('timeline-event');
	});

	it('preserves the existing generate guard contract', () => {
		expect(canGenerateDomain('personae', { projectId: 'project-1', domainCounts: allCounts(0) })).toEqual({
			allowed: true,
			reason: null,
		});
		expect(canGenerateDomain('atlas', { projectId: 'project-1', domainCounts: allCounts(0) })).toMatchObject({
			allowed: false,
		});
	});

	it('sets missing-context without calling generation when dependencies are missing', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		const result = await runWorldbuildingDomainGeneration({
			projectId: 'project-1',
			domainId: 'atlas',
			domainCounts: allCounts(0),
		});

		expect(result).toMatchObject({
			ok: false,
			state: 'missing-context',
			domainId: 'atlas',
			entityKind: 'realm',
		});
		expect(fetchMock).not.toHaveBeenCalled();
		expect(getState('atlas')).toBe('missing-context');
		expect(getMissingContextReason('atlas')).toContain('Personae');
	});

	it('runs real generation and transitions to review-ready when readiness allows', async () => {
		const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
			jsonResponse({
				drafts: [{ name: 'Mock Character 1', role: 'Guide', bio: 'Knows the old road.' }],
				entityKind: 'character',
				projectContext: {
					title: 'Generation Actions',
					genre: 'fantasy',
					logline: 'A guide finds a road that should not exist.',
				},
			}),
		);
		vi.stubGlobal('fetch', fetchMock);

		const result = await runWorldbuildingDomainGeneration({
			projectId: 'project-1',
			domainId: 'personae',
			domainCounts: allCounts(0),
		});

		expect(result).toEqual({
			ok: true,
			state: 'review-ready',
			domainId: 'personae',
			entityKind: 'character',
			draftCount: 1,
		});
		expect(getState('personae')).toBe('review-ready');
		expect(getPhase()).toBe('reviewing');
		expect(getDrafts()).toHaveLength(1);
		const init = fetchMock.mock.calls[0]?.[1];
		expect(JSON.parse(String(init?.body))).toMatchObject({
			projectId: 'project-1',
			entityKind: 'character',
			count: 3,
		});
	});

	it('transitions to failed and keeps the provider error visible', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () =>
				jsonResponse(
					{ error: { code: 'no_credentials', message: 'No AI provider credentials configured.' } },
					401,
				),
			),
		);

		const result = await runWorldbuildingDomainGeneration({
			projectId: 'project-1',
			domainId: 'personae',
			domainCounts: allCounts(0),
		});

		expect(result).toEqual({
			ok: false,
			state: 'failed',
			domainId: 'personae',
			entityKind: 'character',
			reason: 'Add AI provider credentials in Settings, then retry generation.',
		});
		expect(getState('personae')).toBe('failed');
		expect(getPhase()).toBe('error');
	});

	it('blocks a new generation when drafts are already pending review', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
		transition('personae', 'queued');
		transition('personae', 'running');
		transition('personae', 'review-ready');

		const result = await runWorldbuildingDomainGeneration({
			projectId: 'project-1',
			domainId: 'personae',
			domainCounts: allCounts(0),
		});

		expect(result).toEqual({
			ok: false,
			state: 'blocked',
			domainId: 'personae',
			entityKind: 'character',
			reason: 'Review the current generated drafts before starting another generation.',
		});
		expect(fetchMock).not.toHaveBeenCalled();
		expect(getState('personae')).toBe('review-ready');
	});
});

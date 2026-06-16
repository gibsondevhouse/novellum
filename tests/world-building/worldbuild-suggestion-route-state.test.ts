import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	refreshSuggestions,
	refreshSuggestionsForProjectRoute,
	getSuggestionLoadError,
	getSuggestions,
	getTotalPendingCount,
} from '../../src/modules/world-building/stores/worldbuild-suggestion-state.svelte.js';
import type { WorldbuildProposalRecord } from '../../src/lib/ai/pipeline/worldbuild-proposal-schema.js';

const ROUTE_SOURCES = [
	'src/routes/projects/[id]/world-building/+page.svelte',
	'src/routes/projects/[id]/world-building/help/+page.svelte',
];

const NOW = new Date('2026-06-16T12:00:00.000Z').toISOString();

function makeProposal(overrides: Partial<WorldbuildProposalRecord> = {}): WorldbuildProposalRecord {
	return {
		proposalId: 'proposal-001',
		projectId: 'project-001',
		categoryId: 'personae',
		entityKind: 'character',
		status: 'pending_review',
		generatedAt: NOW,
		sourceContext: {
			title: 'Test Novel',
			genre: 'fantasy',
			logline: 'A courier carries a forbidden map.',
			synopsisHash: 'synopsis-001',
		},
		confidence: 0.88,
		reasoningSummary: 'Creates a reviewable character pressure point.',
		payload: { name: 'Mara Venn' },
		dedupeKey: 'personae:character:mara-venn',
		acceptance: null,
		rejection: null,
		...overrides,
	};
}

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

beforeEach(async () => {
	await refreshSuggestions(null);
});

afterEach(async () => {
	vi.unstubAllGlobals();
	await refreshSuggestions(null);
});

describe('worldbuild suggestion route state contract', () => {
	it('hydrates proposal state from the listed worldbuilding routes', () => {
		for (const routeSource of ROUTE_SOURCES) {
			const source = readFileSync(routeSource, 'utf8');

			expect(source).toContain('refreshSuggestionsForProjectRoute(projectId)');
			expect(source).toContain('getPendingWorldbuildSuggestionCount');
			expect(source).toContain('getWorldbuildSuggestionLoadError');
			expect(source).toContain('Worldbuilding proposal review state');
			expect(source).toContain('Could not load worldbuilding suggestions');
		}
	});

	it('loads persisted pending proposals once for repeated same-project route refreshes', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			jsonResponse({
				data: {
					valid: makeProposal(),
					corrupt: {
						proposalId: 'proposal-corrupt',
						projectId: 'project-001',
						categoryId: 'personae',
						entityKind: 'character',
						status: 'pending_review',
					},
				},
			}),
		);
		vi.stubGlobal('fetch', fetchMock);

		await refreshSuggestionsForProjectRoute('project-001');
		await refreshSuggestionsForProjectRoute('project-001');

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(getSuggestions()).toHaveLength(1);
		expect(getTotalPendingCount()).toBe(1);
		expect(getSuggestionLoadError()).toBeNull();
	});

	it('exposes load errors and retries the same project after a failure', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(jsonResponse({ error: 'metadata offline' }, 503))
			.mockResolvedValueOnce(jsonResponse({ data: { valid: makeProposal() } }));
		vi.stubGlobal('fetch', fetchMock);

		await refreshSuggestionsForProjectRoute('project-001');

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(getSuggestionLoadError()).toBe('metadata offline');
		expect(getTotalPendingCount()).toBe(0);

		await refreshSuggestionsForProjectRoute('project-001');

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(getSuggestionLoadError()).toBeNull();
		expect(getTotalPendingCount()).toBe(1);
	});
});

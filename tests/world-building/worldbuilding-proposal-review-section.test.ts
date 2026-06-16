import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import WorldbuildingProposalReviewSection from '../../src/modules/world-building/components/WorldbuildingProposalReviewSection.svelte';
import {
	refreshSuggestions,
	upsertSuggestionLocal,
} from '../../src/modules/world-building/stores/worldbuild-suggestion-state.svelte.js';
import type { WorldbuildProposalRecord } from '../../src/lib/ai/pipeline/worldbuild-proposal-schema.js';

const NOW = new Date('2026-06-16T12:30:00.000Z').toISOString();

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

function makeProposal(
	overrides: Partial<WorldbuildProposalRecord> = {},
): WorldbuildProposalRecord {
	return {
		proposalId: 'proposal-review-001',
		projectId: 'project-review-001',
		categoryId: 'personae',
		entityKind: 'character',
		status: 'pending_review',
		generatedAt: NOW,
		sourceContext: {
			title: 'Review Section Novel',
			genre: 'fantasy',
			logline: 'A cartographer hides a border that should not exist.',
			synopsisHash: 'review-section',
		},
		confidence: 0.91,
		reasoningSummary: 'Adds a reviewable cartographer.',
		payload: { name: 'Mara Venn', role: 'Cartographer' },
		dedupeKey: 'personae:character:mara-venn',
		acceptance: null,
		rejection: null,
		...overrides,
	};
}

beforeEach(async () => {
	await refreshSuggestions(null);
	target = document.createElement('div');
	document.body.appendChild(target);
});

afterEach(async () => {
	if (component) {
		unmount(component);
		component = undefined;
	}
	target.remove();
	await refreshSuggestions(null);
});

describe('WorldbuildingProposalReviewSection', () => {
	it('stays hidden by default when there is no proposal state', () => {
		component = mount(WorldbuildingProposalReviewSection, { target });
		flushSync();

		expect(target.textContent).not.toContain('Suggested worldbuilding changes');
		expect(target.textContent).not.toContain('No pending worldbuilding suggestions');
	});

	it('can render an explicit empty state', () => {
		component = mount(WorldbuildingProposalReviewSection, {
			target,
			props: { showEmpty: true },
		});
		flushSync();

		expect(target.textContent).toContain('Suggested worldbuilding changes');
		expect(target.textContent).toContain('No pending worldbuilding suggestions');
		expect(target.textContent).toContain('Run a scan to create reviewable suggestions');
	});

	it('groups populated proposals by author-readable domain with real action controls', () => {
		upsertSuggestionLocal(makeProposal());

		component = mount(WorldbuildingProposalReviewSection, { target });
		flushSync();

		const text = target.textContent ?? '';
		expect(text).toContain('Suggested worldbuilding changes');
		expect(text).toContain('Personae');
		expect(text).toContain('1 suggestion ready for review');
		expect(text).toContain('Mara Venn');
		expect(text).not.toContain('pending_review');
		expect(text).not.toContain('{"name"');
		expect(target.querySelector('button')?.textContent).toContain('Accept');
	});
});
